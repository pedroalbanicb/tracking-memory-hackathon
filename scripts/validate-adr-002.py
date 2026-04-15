#!/usr/bin/env python3

"""
ADR-002 Validation Script (real-doc validator)

Valida se o ADR-002 esta coerente com os PRDs e com as convencoes do vault.

Run:
  python scripts/validate-adr-002.py
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional


EXPECTED_COLUMNS = [
    "id",
    "skuOff",
    "skuOn",
    "mercadoria",
    "tipoNegociacao",
    "cadastro",
    "validacaoFiscal",
    "propostaComercial",
    "estoque",
    "produzidoSite",
    "produzidoLf",
    "ativacaoPricing",
    "exibicaoSite",
]

STAGE_FIELDS = [
    "cadastro",
    "validacaoFiscal",
    "propostaComercial",
    "estoque",
    "produzidoSite",
    "produzidoLf",
    "ativacaoPricing",
    "exibicaoSite",
]


class ADR002Validator:
    def __init__(self, repo_root: Path) -> None:
        self.repo_root = repo_root
        self.adr_path = repo_root / "ADR" / "ADR-002-contrato-api-tracking-skus-fase-1-graphql.md"
        self.prd1_path = repo_root / "PRD" / "PRD-001-tracking-sku-lifecycle.md"
        self.prd2_path = repo_root / "PRD" / "PRD-002-frontend-tracking.md"

        self.ok = 0
        self.fail = 0
        self.warn = 0
        self.warnings: List[str] = []
        self.failures: List[str] = []

    def run(self) -> int:
        print("=" * 78)
        print("ADR-002 Contract Validator")
        print("=" * 78)

        adr = self._read(self.adr_path)
        prd1 = self._read(self.prd1_path)
        prd2 = self._read(self.prd2_path)

        self._validate_frontmatter(adr)
        self._validate_endpoint_presence(adr)
        self._validate_response_shape(adr)
        self._validate_mapping_table(adr)
        self._validate_graphql_query(adr)
        self._validate_prd_alignment(prd1, prd2, adr)

        return self._summary()

    def _read(self, path: Path) -> str:
        if not path.exists():
            self._fail(f"Arquivo ausente: {path}")
            return ""
        return path.read_text(encoding="utf-8")

    def _validate_frontmatter(self, adr: str) -> None:
        print("\n[1] Frontmatter ADR")
        fm = self._extract_frontmatter(adr)
        required = ["tags", "status", "data", "autores", "rfc-relacionada", "updated"]
        for key in required:
            self._check(f"frontmatter contem '{key}'", key in fm)

    def _validate_endpoint_presence(self, adr: str) -> None:
        print("\n[2] Contrato do endpoint")
        self._check("endpoint POST /api/v1/tracking/skus/listar presente", "POST /api/v1/tracking/skus/listar" in adr)

        request_json = self._extract_json_after_header(adr, "Entrada")
        self._check("json de entrada encontrado", request_json is not None)
        if request_json:
            self._check("entrada contem 'skus'", "skus" in request_json)
            self._check("entrada contem 'pagina'", "pagina" in request_json)
            self._check("entrada contem 'take'", "take" in request_json)

    def _validate_response_shape(self, adr: str) -> None:
        print("\n[3] Payload de saida")
        response_json = self._extract_json_after_header(adr, "Saida")
        self._check("json de saida encontrado", response_json is not None)
        if not response_json:
            return

        data = response_json.get("data", {})
        items = data.get("items", [])
        self._check("saida contem data.items", isinstance(items, list) and len(items) > 0)
        if not items:
            return

        item = items[0]
        for col in EXPECTED_COLUMNS:
            self._check(f"item possui campo '{col}'", col in item)

        null_stage_count = sum(1 for f in STAGE_FIELDS if f != "cadastro" and item.get(f) is None)
        self._check("fase 1 usa null em 7 etapas (E02,E03,E05-E09)", null_stage_count == 7)

    def _validate_mapping_table(self, adr: str) -> None:
        print("\n[4] Tabela de mapeamento fase 1")
        for col in EXPECTED_COLUMNS:
            pattern = rf"\|\s*`{re.escape(col)}`(?:\s*\([^|`]+\))?\s*\|"
            self._check(
                f"tabela contem linha para '{col}'",
                re.search(pattern, adr) is not None,
            )

        self._check("regra de uppercase em tipoNegociacao", "uppercase na API" in adr)
        self._check("regra de null temporario declarada", "campos de etapa sem fonte nao serao inferidos como `false`" in adr)

    def _validate_graphql_query(self, adr: str) -> None:
        print("\n[5] Query GraphQL enxuta")
        gql = self._extract_code_block_after_header(adr, "Query enxuta recomendada", "graphql")
        self._check("query graphql encontrada", gql is not None)
        if not gql:
            return

        required_tokens = [
            "query GetMercadorias",
            "$skip",
            "$take",
            "$sku",
            "items",
            "id",
            "nome",
            "dePara",
            "idSkuLoja",
            "idSkuOn",
            "tipoMercadoria",
            "situacaoCadastral",
            "tipoSituacaoCadastral",
        ]
        for token in required_tokens:
            self._check(f"query contem '{token}'", token in gql)

        self._check("query filtra Conjunto", "neq: \"Conjunto\"" in gql)

    def _validate_prd_alignment(self, prd1: str, prd2: str, adr: str) -> None:
        print("\n[6] Aderencia entre ADR e PRDs")
        self._check("PRD-001 restringe escopo para 1P", "1P" in prd1 and "3P" in prd1)
        self._check("PRD-002 declara E04 fora da tabela", "E04 (Agendamento) nao e exibido como coluna" in self._normalize(prd2))

        adr_endpoint = self._find_first(r"POST /api/v1/tracking/skus/listar", adr)
        prd_endpoint = self._find_first(r"GET /api/tracking/skus", prd2)
        if adr_endpoint and prd_endpoint:
            self._warning(
                "Endpoint diverge entre docs: ADR usa POST /api/v1/tracking/skus/listar e PRD-002 sugere GET /api/tracking/skus"
            )

        if "booleanas (`true`/`false`)" in prd2 and "nao serao inferidos como `false`" in adr:
            self._warning(
                "Tipo de etapa diverge por fase: PRD-002 espera boolean, ADR fase 1 publica null temporario"
            )

    @staticmethod
    def _extract_frontmatter(text: str) -> Dict[str, str]:
        match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
        if not match:
            return {}
        raw = match.group(1)
        data: Dict[str, str] = {}
        for line in raw.splitlines():
            if ":" not in line:
                continue
            key, val = line.split(":", 1)
            data[key.strip()] = val.strip()
        return data

    @staticmethod
    def _find_first(pattern: str, text: str) -> Optional[str]:
        m = re.search(pattern, text)
        return m.group(0) if m else None

    def _extract_json_after_header(self, text: str, header_word: str) -> Optional[Dict]:
        pattern = rf"{header_word}.*?```json\n(.*?)\n```"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        if not match:
            return None
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            self._fail(f"JSON invalido na secao '{header_word}'")
            return None

    def _extract_code_block_after_header(self, text: str, header_word: str, lang: str) -> Optional[str]:
        pattern = rf"{header_word}.*?```{lang}\n(.*?)\n```"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return match.group(1) if match else None

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.replace("ã", "a").replace("á", "a").replace("â", "a")
        text = text.replace("é", "e").replace("ê", "e")
        text = text.replace("í", "i")
        text = text.replace("ó", "o").replace("ô", "o")
        text = text.replace("ú", "u")
        text = text.replace("ç", "c")
        return text

    def _check(self, description: str, result: bool) -> None:
        if result:
            self.ok += 1
            print(f"  [OK]   {description}")
        else:
            self.fail += 1
            self.failures.append(description)
            print(f"  [FAIL] {description}")

    def _warning(self, message: str) -> None:
        self.warn += 1
        self.warnings.append(message)
        print(f"  [WARN] {message}")

    def _fail(self, message: str) -> None:
        self.fail += 1
        self.failures.append(message)
        print(f"  [FAIL] {message}")

    def _summary(self) -> int:
        total = self.ok + self.fail
        pct = (self.ok / total * 100.0) if total else 0.0
        print("\n" + "=" * 78)
        print("RESULT")
        print("=" * 78)
        print(f"OK:   {self.ok}")
        print(f"FAIL: {self.fail}")
        print(f"WARN: {self.warn}")
        print(f"Score: {pct:.1f}%")

        if self.failures:
            print("\nFalhas:")
            for item in self.failures:
                print(f"- {item}")

        if self.warnings:
            print("\nWarnings:")
            for item in self.warnings:
                print(f"- {item}")

        print("\nStatus final: {}".format("APROVADO" if self.fail == 0 else "REPROVADO"))
        return 0 if self.fail == 0 else 1


def main() -> int:
    script_path = Path(__file__).resolve()
    repo_root = script_path.parent.parent
    validator = ADR002Validator(repo_root)
    return validator.run()


if __name__ == "__main__":
    raise SystemExit(main())

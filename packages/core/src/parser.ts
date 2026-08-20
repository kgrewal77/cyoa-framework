import type { ComparisonOp, ConditionNode, EffectNode, Literal } from "./types.js";

export class ParseError extends Error {
  constructor(message: string, source: string) {
    super(`${message} (in expression: ${JSON.stringify(source)})`);
    this.name = "ParseError";
  }
}

type TokenType =
  | "PATH"
  | "NUMBER"
  | "STRING"
  | "BOOLEAN"
  | "CMPOP"
  | "ASSIGNOP"
  | "AND"
  | "OR"
  | "NOT"
  | "LPAREN"
  | "RPAREN"
  | "COMMA"
  | "EOF";

interface Token {
  type: TokenType;
  value: string;
}

const CMP_OPS = ["===", "!==", ">=", "<=", ">", "<"] as const;
const ASSIGN_OPS = ["+=", "-=", "*=", "/=", "="] as const;

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === undefined) break;

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: ch });
      i++;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let value = "";
      while (j < source.length && source[j] !== quote) {
        if (source[j] === "\\" && j + 1 < source.length) {
          value += source[j + 1];
          j += 2;
        } else {
          value += source[j];
          j++;
        }
      }
      if (source[j] !== quote) {
        throw new ParseError("Unterminated string literal", source);
      }
      tokens.push({ type: "STRING", value });
      i = j + 1;
      continue;
    }

    const rest = source.slice(i);

    const matchedCmp = CMP_OPS.find((op) => rest.startsWith(op));
    if (matchedCmp) {
      tokens.push({ type: "CMPOP", value: matchedCmp });
      i += matchedCmp.length;
      continue;
    }

    const matchedAssign = ASSIGN_OPS.find((op) => rest.startsWith(op));
    if (matchedAssign) {
      tokens.push({ type: "ASSIGNOP", value: matchedAssign });
      i += matchedAssign.length;
      continue;
    }

    if (rest.startsWith("&&")) {
      tokens.push({ type: "AND", value: "&&" });
      i += 2;
      continue;
    }
    if (rest.startsWith("||")) {
      tokens.push({ type: "OR", value: "||" });
      i += 2;
      continue;
    }
    if (ch === "!") {
      tokens.push({ type: "NOT", value: "!" });
      i++;
      continue;
    }

    const numberMatch = /^-?\d+(\.\d+)?/.exec(rest);
    if (numberMatch) {
      tokens.push({ type: "NUMBER", value: numberMatch[0] });
      i += numberMatch[0].length;
      continue;
    }

    if (rest.startsWith("true") && !/[A-Za-z0-9_.]/.test(rest[4] ?? "")) {
      tokens.push({ type: "BOOLEAN", value: "true" });
      i += 4;
      continue;
    }
    if (rest.startsWith("false") && !/[A-Za-z0-9_.]/.test(rest[5] ?? "")) {
      tokens.push({ type: "BOOLEAN", value: "false" });
      i += 5;
      continue;
    }
    if (rest.startsWith("contains") && !/[A-Za-z0-9_.]/.test(rest[8] ?? "")) {
      tokens.push({ type: "CMPOP", value: "contains" });
      i += 8;
      continue;
    }

    const pathMatch = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*/.exec(rest);
    if (pathMatch) {
      tokens.push({ type: "PATH", value: pathMatch[0] });
      i += pathMatch[0].length;
      continue;
    }

    throw new ParseError(`Unexpected character "${ch}"`, source);
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

class TokenStream {
  private pos = 0;
  constructor(
    private readonly tokens: Token[],
    private readonly source: string,
  ) {}

  peek(): Token {
    return this.tokens[this.pos] ?? { type: "EOF", value: "" };
  }

  next(): Token {
    const token = this.peek();
    this.pos++;
    return token;
  }

  expect(type: TokenType): Token {
    const token = this.next();
    if (token.type !== type) {
      throw new ParseError(`Expected ${type} but got ${token.type} ("${token.value}")`, this.source);
    }
    return token;
  }
}

function cmpOpToNode(op: string): ComparisonOp {
  switch (op) {
    case "===":
      return "eq";
    case "!==":
      return "neq";
    case ">":
      return "gt";
    case ">=":
      return "gte";
    case "<":
      return "lt";
    case "<=":
      return "lte";
    case "contains":
      return "contains";
    default:
      throw new Error(`Unreachable: unknown comparison operator "${op}"`);
  }
}

function parseLiteral(stream: TokenStream, source: string): Literal {
  const token = stream.next();
  switch (token.type) {
    case "NUMBER":
      return Number(token.value);
    case "STRING":
      return token.value;
    case "BOOLEAN":
      return token.value === "true";
    default:
      throw new ParseError(`Expected a literal value but got ${token.type} ("${token.value}")`, source);
  }
}

function parseComparison(stream: TokenStream, source: string): ConditionNode {
  const pathToken = stream.expect("PATH");
  const opToken = stream.next();
  if (opToken.type !== "CMPOP") {
    throw new ParseError(`Expected a comparison operator after "${pathToken.value}"`, source);
  }
  const value = parseLiteral(stream, source);
  return { op: cmpOpToNode(opToken.value), path: pathToken.value, value };
}

function parseUnary(stream: TokenStream, source: string): ConditionNode {
  if (stream.peek().type === "NOT") {
    stream.next();
    return { op: "not", condition: parseUnary(stream, source) };
  }
  if (stream.peek().type === "LPAREN") {
    stream.next();
    const inner = parseOr(stream, source);
    stream.expect("RPAREN");
    return inner;
  }
  return parseComparison(stream, source);
}

function parseAnd(stream: TokenStream, source: string): ConditionNode {
  const conditions = [parseUnary(stream, source)];
  while (stream.peek().type === "AND") {
    stream.next();
    conditions.push(parseUnary(stream, source));
  }
  return conditions.length === 1 ? conditions[0]! : { op: "and", conditions };
}

function parseOr(stream: TokenStream, source: string): ConditionNode {
  const conditions = [parseAnd(stream, source)];
  while (stream.peek().type === "OR") {
    stream.next();
    conditions.push(parseAnd(stream, source));
  }
  return conditions.length === 1 ? conditions[0]! : { op: "or", conditions };
}

export function parseConditionExpr(source: string): ConditionNode {
  const stream = new TokenStream(tokenize(source), source);
  const node = parseOr(stream, source);
  stream.expect("EOF");
  return node;
}

const SET_OP_MAP: Record<string, "set" | "add" | "subtract" | "multiply" | "divide"> = {
  "=": "set",
  "+=": "add",
  "-=": "subtract",
  "*=": "multiply",
  "/=": "divide",
};

export function parseEffectExpr(source: string): EffectNode {
  const stream = new TokenStream(tokenize(source), source);
  const pathToken = stream.expect("PATH");

  if (stream.peek().type === "LPAREN") {
    const methodMatch = /^(.*)\.(push|remove)$/.exec(pathToken.value);
    if (!methodMatch) {
      throw new ParseError(
        `Expected ".push(" or ".remove(" after path "${pathToken.value}"`,
        source,
      );
    }
    const [, objectPath, method] = methodMatch;
    stream.next();
    const value = parseLiteral(stream, source);
    stream.expect("RPAREN");
    stream.expect("EOF");
    return { op: method as "push" | "remove", path: objectPath!, value };
  }

  const opToken = stream.next();
  if (opToken.type !== "ASSIGNOP") {
    throw new ParseError(
      `Expected an assignment operator (=, +=, -=, *=, /=) after "${pathToken.value}"`,
      source,
    );
  }
  const value = parseLiteral(stream, source);
  stream.expect("EOF");
  return { op: SET_OP_MAP[opToken.value]!, path: pathToken.value, value };
}

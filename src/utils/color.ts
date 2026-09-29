export const ANSI_RESET = "\x1b[0m";
export const ANSI_BOLD = "\x1b[1m";
export const ANSI_DIM = "\x1b[2m";
export const ANSI_RED = "\x1b[31m";
export const ANSI_GREEN = "\x1b[32m";
export const ANSI_YELLOW = "\x1b[33m";
export const ANSI_BLUE = "\x1b[34m";
export const ANSI_MAGENTA = "\x1b[35m";
export const ANSI_CYAN = "\x1b[36m";
export const ANSI_WHITE = "\x1b[37m";
export const ANSI_BG_RED = "\x1b[41m";
export const ANSI_BG_GREEN = "\x1b[42m";
export const ANSI_BG_YELLOW = "\x1b[43m";

export function colorJson(obj: any, indent: number = 2): string {
  const jsonStr = JSON.stringify(obj, null, indent);
  return jsonStr.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          // Key
          return `${ANSI_CYAN}${ANSI_BOLD}${match.slice(0, -1)}${ANSI_RESET}:`;
        } else {
          // String Value
          return `${ANSI_GREEN}${match}${ANSI_RESET}`;
        }
      } else if (/true|false/.test(match)) {
        // Boolean
        return `${ANSI_YELLOW}${ANSI_BOLD}${match}${ANSI_RESET}`;
      } else if (/null/.test(match)) {
        // Null
        return `${ANSI_DIM}${match}${ANSI_RESET}`;
      } else {
        // Number
        return `${ANSI_MAGENTA}${match}${ANSI_RESET}`;
      }
    }
  );
}

export function drawCard(title: string, content: string, borderColor: string = ANSI_CYAN): string {
  const lines = content.split("\n");
  const maxContentLength = Math.max(...lines.map((l) => l.replace(/\x1b\[[0-9;]*m/g, "").length), title.length + 4, 45);
  const width = Math.min(80, Math.max(maxContentLength, 45));

  const topBorder = `${borderColor}┌─ ${ANSI_BOLD}${ANSI_WHITE}${title}${ANSI_RESET} ${borderColor}${"─".repeat(Math.max(0, width - title.length - 4))}┐${ANSI_RESET}`;
  const bottomBorder = `${borderColor}└${"─".repeat(width)}┘${ANSI_RESET}`;

  const body = lines.map((l) => `  ${l}`).join("\n");
  return `${topBorder}\n${body}\n${bottomBorder}`;
}

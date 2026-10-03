/**
 * HTML を安全に組み立てるための小さな道具。
 *
 *   html`<p>${text}</p>`   … ${} の中は自動でエスケープされる
 *   raw(str)               … エスケープしない（組み立て済みの HTML を入れるとき）
 *   配列はそのまま連結される。null / undefined / false は何も出力しない。
 */

export class Raw {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

export const raw = (value: string): Raw => new Raw(value);

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type Value = Raw | string | number | null | undefined | false | Value[];

function render(value: Value): string {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof Raw) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escapeHtml(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Value[]): Raw {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Raw(out);
}

/** JSON-LD 用。</script> で閉じられないようにする */
export function jsonForScript(data: unknown): Raw {
  return raw(JSON.stringify(data).replace(/</g, '\\u003c'));
}

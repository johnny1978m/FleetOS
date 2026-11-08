const SEPARATOR = ";";

function toCell(value) {
  if (value === null || value === undefined) return '""';

  let text = String(value);

  if (typeof value !== "number" && /^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function formatCsvNumber(value) {
  return Number(value || 0).toFixed(2).replace(".", ",");
}

export function exportCsv(name, columns, rows) {
  const lines = [
    columns.map((column) => toCell(column.label)).join(SEPARATOR),
  ];

  rows.forEach((row) => {
    lines.push(
      columns.map((column) => toCell(column.value(row))).join(SEPARATOR),
    );
  });

  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const filename = `${name}-${now.getFullYear()}-${month}-${day}.csv`;

  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

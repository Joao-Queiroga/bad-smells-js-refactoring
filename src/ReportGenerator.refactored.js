export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const header = this.#generateHeader(reportType, user);
    const bodyResult = this.#generateBody(reportType, user, items);
    const footer = this.#generateFooter(reportType, bodyResult.total);
    return `${header}${bodyResult.content}${footer}`.trim();
  }

  // --- Cabeçalho ---
  #generateHeader(reportType, user) {
    if (reportType === "CSV") {
      return "ID,NOME,VALOR,USUARIO\n";
    }
    if (reportType === "HTML") {
      return (
        "<html><body>\n" +
        "<h1>Relatório</h1>\n" +
        `<h2>Usuário: ${user.name}</h2>\n` +
        "<table>\n" +
        "<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n"
      );
    }
    return "";
  }

  // --- Corpo ---
  #generateBody(reportType, user, items) {
    let content = "";
    let total = 0;

    const visibleItems =
      user.role === "ADMIN" ? items : items.filter((item) => item.value <= 500);

    for (const item of visibleItems) {
      const processed = this.#processItem(user, item, reportType);
      content += processed.line;
      total += processed.value;
    }

    return { content, total };
  }

  // --- Processamento de Itens ---
  #processItem(user, item, reportType) {
    if (user.role === "ADMIN" && item.value > 1000) {
      item.priority = true;
    }

    if (reportType === "CSV") {
      return {
        line: `${item.id},${item.name},${item.value},${user.name}\n`,
        value: item.value,
      };
    }

    if (reportType === "HTML") {
      const style = item.priority ? ' style="font-weight:bold;"' : "";
      return {
        line: `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`,
        value: item.value,
      };
    }

    return { line: "", value: 0 };
  }

  // --- Rodapé ---
  #generateFooter(reportType, total) {
    if (reportType === "CSV") {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === "HTML") {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    }
    return "";
  }
}

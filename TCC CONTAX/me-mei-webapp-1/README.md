# ME & MEI Web Application

## Overview
This project is a web application designed to assist Micro Enterprises (ME) and Micro Entrepreneurs (MEI) in managing their financial activities. It provides a user-friendly interface with various tabs for tracking income, expenses, taxes, and issued invoices.

## Project Structure
```
me-mei-webapp
├── src
│   ├── index.html          # Main HTML document for the web application
│   ├── main.js             # Entry point for JavaScript functionality
│   ├── style.css           # Styles for the web application
│   ├── components          # Contains JavaScript files for different tabs
│   │   ├── me
│   │   │   ├── caixa.js                # Functionality for the "Caixa" tab
│   │   │   ├── despesas.js             # Functionality for the "Despesas" tab
│   │   │   ├── faturamento.js          # Functionality for the "Faturamento" tab
│   │   │   ├── imposto.js              # Functionality for the "Imposto" tab
│   │   │   └── notas-fiscais-emitidas.js # Functionality for the "Notas Fiscais Emitidas" tab
│   │   └── mei
│   │       ├── imposto-das.js          # Functionality for the "Imposto DAS" tab
│   │       ├── notas-emitidas.js       # Functionality for the "Notas Emitidas" tab
│   │       └── controle-mensal.js      # Functionality for the "Controle Mensal" tab
│   └── types
│       └── index.ts                    # TypeScript types and interfaces
├── package.json                        # npm configuration file
└── README.md                           # Project documentation
```

## Features
- **For Micro Enterprises (ME):**
  - **Caixa:** Manage cash flow and transactions.
  - **Despesas:** Input and view expense data.
  - **Faturamento:** Track revenue and sales.
  - **Imposto:** Calculate and view tax information.
  - **Notas Fiscais Emitidas:** Display issued invoices and related details.

- **For Micro Entrepreneurs (MEI):**
  - **Imposto DAS:** Information and functionality related to the DAS tax.
  - **Notas Emitidas:** View issued notes.
  - **Controle Mensal:** Spreadsheet-like interface for monthly control.

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd me-mei-webapp
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Open `src/index.html` in a web browser to view the application.

## Usage
- Select the appropriate category (ME or MEI) to access the relevant tabs.
- Use the forms and tables provided in each tab to manage financial data effectively.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License.
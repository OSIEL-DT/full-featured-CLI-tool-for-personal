const fs = require('fs');
const path = require('path');
const readline = require('readline');

// File to store transactions
const DATA_FILE = path.join(__dirname, 'transactions.json');

// Readline interface for CLI interaction
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Load transactions from file or initialize an empty array
let transactions = [];
if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    transactions = JSON.parse(data);
} else {
    transactions = [];
}

// Save transactions to file
const saveTransactions = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(transactions, null, 4));
};

// Add a new transaction
const addTransaction = (type, description, amount) => {
    const newTransaction = {
        id: transactions.length + 1,
        type,
        description,
        amount: parseFloat(amount),
        date: new Date().toISOString()
    };
    transactions.push(newTransaction);
    saveTransactions();
    console.log(`Transaction added: ${description} - ${type} of $${amount}`);
};

// Remove a transaction by ID
const removeTransaction = (id) => {
    const newTransactions = transactions.filter(txn => txn.id !== id);
    if (newTransactions.length === transactions.length) {
        console.log(`Transaction with ID ${id} not found.`);
    } else {
        transactions = newTransactions;
        saveTransactions();
        console.log(`Transaction with ID ${id} removed.`);
    }
};

// Update a transaction
const updateTransaction = (id, type, description, amount) => {
    const transaction = transactions.find(txn => txn.id === id);
    if (transaction) {
        transaction.type = type || transaction.type;
        transaction.description = description || transaction.description;
        transaction.amount = parseFloat(amount) || transaction.amount;
        saveTransactions();
        console.log(`Transaction with ID ${id} updated.`);
    } else {
        console.log(`Transaction with ID ${id} not found.`);
    }
};

// List all transactions
const listTransactions = () => {
    if (transactions.length === 0) {
        console.log("No transactions found.");
        return;
    }
    transactions.forEach(txn => {
        console.log(`[${txn.id}] ${txn.date}: ${txn.description} - ${txn.type} of $${txn.amount}`);
    });
};

// Show the balance (total income - total expenses)
const showBalance = () => {
    let income = 0;
    let expenses = 0;

    transactions.forEach(txn => {
        if (txn.type === 'income') {
            income += txn.amount;
        } else if (txn.type === 'expense') {
            expenses += txn.amount;
        }
    });

    const balance = income - expenses;
    console.log(`Total Income: $${income}`);
    console.log(`Total Expenses: $${expenses}`);
    console.log(`Balance: $${balance}`);
};

// CLI interaction
const mainMenu = () => {
    console.log("\nPersonal Budget Tracker Menu:");
    console.log("1. Add Transaction");
    console.log("2. Remove Transaction");
    console.log("3. Update Transaction");
    console.log("4. List Transactions");
    console.log("5. Show Balance");
    console.log("0. Exit");

    rl.question("Choose an option: ", (choice) => {
        switch (choice) {
            case '1':
                rl.question("Enter transaction type (income/expense): ", (type) => {
                    rl.question("Enter description: ", (description) => {
                        rl.question("Enter amount: ", (amount) => {
                            addTransaction(type, description, amount);
                            mainMenu();
                        });
                    });
                });
                break;

            case '2':
                rl.question("Enter transaction ID to remove: ", (id) => {
                    removeTransaction(parseInt(id));
                    mainMenu();
                });
                break;

            case '3':
                rl.question("Enter transaction ID to update: ", (id) => {
                    rl.question("Enter new type (income/expense or leave blank): ", (type) => {
                        rl.question("Enter new description (or leave blank): ", (description) => {
                            rl.question("Enter new amount (or leave blank): ", (amount) => {
                                updateTransaction(parseInt(id), type, description, amount);
                                mainMenu();
                            });
                        });
                    });
                });
                break;

            case '4':
                listTransactions();
                mainMenu();
                break;

            case '5':
                showBalance();
                mainMenu();
                break;

            case '0':
                console.log("Exiting Personal Budget Tracker.");
                rl.close();
                break;

            default:
                console.log("Invalid option, please try again.");
                mainMenu();
                break;
        }
    });
};

// Start the program
console.log("Welcome to the Personal Budget Tracker!");
mainMenu();

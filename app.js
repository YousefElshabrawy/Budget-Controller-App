var budgetController = (function() {
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };
    Expense.prototype.calcObjPrecentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.precentage = Math.round((this.value / totalIncome) * 100);
        } else this.precentage = -1;
    };
    Expense.prototype.getObjPrecentage = function() {
        return this.precentage;
    };
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calcTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        precentage: -1,
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            //create new ID
            // ID = the last ID + 1
            if (data.allItems[type].length >= 1) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else ID = 0;
            //create new Item based on the type
            if (type === "inc") {
                newItem = new Income(ID, des, val);
            } else if (type === "exp") {
                newItem = new Expense(ID, des, val);
            }
            //push it to our data structure
            data.allItems[type].push(newItem); // object.key === object["key"]
            //return out new element
            return newItem;
        },
        calcBudget: function() {
            calcTotal("exp");
            calcTotal("inc");
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else data.precentage = -1;
        },
        calcPrecentages: function() {
            data.allItems["exp"].forEach(function(cur) {
                cur.calcObjPrecentage(data.totals.inc);
            });
        },
        getPrecentages: function() {
            var allPrecentages = data.allItems.exp.map(function(cur) {
                return cur.getObjPrecentage();
            });
            return allPrecentages;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                inc: data.totals.inc,
                exp: data.totals.exp,
                precentage: data.precentage,
            };
        },
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(cur) {
                return cur.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
                //console.log("deleteItem is called");
            }
        },
        test: function() {
            console.log(data);
        },
    };
})();

var UIController = (function() {
    //some private code
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        budgetIncomeValue: ".budget__income--value",
        budgetExpensesValue: ".budget__expenses--value",
        budgetExpensesPrecentage: ".budget__expenses--percentage",
        container: ".container",
        expensesPrecentage: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    var formatNumber = function(num, type) {
        var splitedNum, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2); //6212.2265 --> "6212.27"
        splitedNum = num.split(".");
        int = splitedNum[0]; // "6212"
        dec = splitedNum[1]; // "27"
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
            // "6" + "," +"212" = "6,212"
        }
        return (type === "inc" ? "+" : "-") + " " + int + "." + dec;
    };
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === "inc") {
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%disc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = DOMstrings.incomeContainer;
            } else if (type === "exp") {
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%disc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                element = DOMstrings.expenseContainer;
            }
            //replace the place holder with the actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%disc%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
            //insert
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            //console.log("addlistitem is called");
        },
        deleteListItem: function(selectedID) {
            var element = document.getElementById(selectedID);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields, arrayFields;
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ", " + DOMstrings.inputValue
            );
            arrayFields = Array.prototype.slice.call(fields);
            arrayFields.forEach(function(current, index, array) {
                current.value = "";
            });
            arrayFields[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
                obj.budget,
                obj.budget >= 0 ? "inc" : "exp"
            );
            document.querySelector(
                DOMstrings.budgetExpensesValue
            ).textContent = formatNumber(obj.exp, "exp");
            document.querySelector(
                DOMstrings.budgetIncomeValue
            ).textContent = formatNumber(obj.inc, "inc");
            if (obj.precentage > 0) {
                document.querySelector(
                    DOMstrings.budgetExpensesPrecentage
                ).textContent = obj.precentage + " %";
            } else {
                document.querySelector(
                    DOMstrings.budgetExpensesPrecentage
                ).textContent = "---";
            }
        },
        displayPrecentages: function(precentages) {
            var items = document.querySelectorAll(DOMstrings.expensesPrecentage);
            for (var i = 0; i < items.length; i++) {
                if (precentages[i] > 0) {
                    items[i].textContent = precentages[i] + "%";
                } else items[i].textContent = "---";
            }
        },
        displayDate: function() {
            var now, year, month;
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                month + 1 + ", " + year;
        },
        changeTheme: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType +
                "," +
                DOMstrings.inputValue +
                "," +
                DOMstrings.inputDescription
            );
            for (var i = 0; i < fields.length; i++) {
                fields[i].classList.toggle("red-focus");
            }
            document.querySelector(DOMstrings.inputButton).classList.toggle("red");
        },
        // function to pass the domstrings to the controller without copying it there
        getDOMstrings: function() {
            return DOMstrings;
        },
    };
})();
var controller = (function(budgetCtrl, UICtrl) {
    var updateBudget = function() {
        // calculate the budget
        budgetCtrl.calcBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        // display the budget in the ui
        UICtrl.displayBudget(budget);
    };
    var updatePrecentages = function() {
        // calculate the precentage
        budgetCtrl.calcPrecentages();
        // return the precentages
        var precentages = budgetCtrl.getPrecentages();
        // display on the UI
        UICtrl.displayPrecentages(precentages);
    };
    //This function is for DRY principle.
    var ctrlAddItem = function() {
        // get the input from the input fields
        var input = UICtrl.getInput();
        if (input.description.trim() !== "" && !isNaN(input.value)) {
            // add the item to the budget controller
            var newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );
            //add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            //clear fields
            UICtrl.clearFields();
            //calculate and update the budget
            updateBudget();
            //update and show the new precentage
            updatePrecentages();
        }
    };
    var ctrlDeleteItem = function(event) {
        var itemID, ID, type, splitedID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitedID = itemID.split("-");
        type = splitedID[0];
        ID = parseInt(splitedID[1]);
        //delete the item from the budget
        budgetCtrl.deleteItem(type, ID);
        //delete the item from the ui
        UICtrl.deleteListItem(itemID);
        //update and show the new budget
        updateBudget();
        //update and show the new precentage
        updatePrecentages();
    };
    var setupEventListener = function() {
        //To get the dom strings from the UI module
        var DOM = UICtrl.getDOMstrings();
        document
            .querySelector(DOM.inputButton)
            .addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);
        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changeTheme);
    };
    return {
        inti: function() {
            setupEventListener();
            UICtrl.displayBudget({
                budget: 0,
                inc: 0,
                exp: 0,
                precentage: -1,
            });
            UICtrl.displayDate();
        },
    };
})(budgetController, UIController);
controller.inti();
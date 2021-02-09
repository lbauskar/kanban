"use strict";

class MessageSender {
    static #vscode = acquireVsCodeApi();

    static send(command, data) {
        this.#vscode.postMessage({
            command: command,
            data: data
        });
    }
}

let keysPressed = {}; //keep track of what keys are pressed
let icons = {};

function addListeners() {

    document.addEventListener("keydown", event => { //key is pressed
        keysPressed[event.key] = true;

        if (keysPressed["Control"] && event.key === "s") { //check if ctrl + s is pressed
            saveData();
        }
    });

    document.addEventListener("keyup", event => { //key is unpressed
        keysPressed[event.key] = false;
    });

    window.addEventListener("message", event => { // listen for message
        const message = event.data;
        switch (message.command) {
            case "load":
                loadData(message.data);
                break;
            case "icons":
                icons = message;
                break;
        }
    });

    window.addEventListener("resize", () => {
        setColumnWidths();
    });


    function saveData() {
        const columns = document.getElementById("board").children;
        let data = {};
        data.ncols = columns.length;
        data.cols = [];

        for (const column of columns) {
            let col = {};
            const children = column.children;
            col.ntasks = children.length - 1;
            col.tasks = [];

            for (const child of children) {
                if (child.className === "header") {
                    col.title = child.firstElementChild.innerHTML;
                } else {
                    col.tasks.push(child.firstElementChild.innerHTML);
                }
            }

            data.cols.push(col);
        }

        MessageSender.send("save", data);
    }


    const columns = document.getElementsByClassName("col");

    for (const col of columns) {
        const children = col.firstElementChild.children;

        const addBtn = children[1];
        const remBtn = children[2];

        addBtn.addEventListener("click", () => { //create new task and add it to bottom of column
            makeTask(col, "Add your own text here!");
        });

        remBtn.addEventListener("click", () => { //delete col
            removeColumn(col);
        });
    }

    const iconColor = colorToFilter(getComputedStyle(document.getElementById("titlebar")).color);
    const iconHover = colorToFilter(getComputedStyle(document.getElementsByClassName("header")[0]).backgroundColor);
    console.log(iconHover);

    const addCol = document.getElementById("add-col");
    addCol.addEventListener("click", () => {
        let board = document.getElementById("board");
        const column = makeColumn(`Column ${board.children.length + 1}`);
    });

    const saveBtn = document.getElementById("save");
    saveBtn.addEventListener("click", () => { //save button clicked
        saveData();
    });
    
    const buttonIcons = document.getElementById("titlebar").getElementsByTagName("img");
    for (let icon of buttonIcons) {
        icon.style.filter = iconColor;
        icon.addEventListener("mouseenter", () => {
            icon.style.filter = iconHover;
        });
        icon.addEventListener("mouseleave", () => {
            icon.style.filter = iconColor;
        });
    }
}

function loadData(data) {
    let columns = document.getElementsByClassName("col");
    let board = document.getElementById("board");
    while (columns.length > 0) {
        board.removeChild(columns[0]);
    }

    data.cols.forEach(col => {
        let column = makeColumn(col.title);
        col.tasks.forEach(task => {
            makeTask(column, task);
        });
    });

}

function makeColumn(title) {
    let column = document.createElement("div");
    column.className = "col";

    column.addEventListener("dragover", event => {
        event.preventDefault();
        const draggable = document.getElementsByClassName("dragging")[0];
        const taskBelow = getClosestTask(column, event.clientX, event.clientY);
        if (taskBelow === null) {
            column.appendChild(draggable);
        } else {
            column.insertBefore(draggable, taskBelow);
        }
    });

    let header = document.createElement("div");
    header.className = "header";

    let headerText = document.createElement("h2");
    headerText.contentEditable = true;
    headerText.innerHTML = title;

    let newTask = document.createElement("button");
    newTask.innerText = "Add Task";
    newTask.addEventListener("click", () => {
        makeTask(column, "Add your own text here!");
    });

    let delCol = document.createElement("button");
    delCol.innerHTML = "Delete Column";
    delCol.addEventListener("click", () => {
        removeColumn(column);
    });

    header.append(headerText, newTask, delCol);
    column.appendChild(header);
    document.getElementById("board").appendChild(column);
    setColumnWidths();
    return column;
}

function makeTask(column, text) {
    let task = document.createElement("div");
    task.className = "task";
    task.draggable = true;

    task.addEventListener("dragstart", () => {
        task.classList.add("dragging");
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
    });

    let taskText = document.createElement("p");
    taskText.contentEditable = true;
    taskText.innerHTML = text;

    let delTask = document.createElement("a");
    delTask.addEventListener("click", () => {
        //TODO: Add way to restore task
        task.remove();
    });

    let delTaskIcon = document.createElement("img");
    delTaskIcon.src = icons.delete;

    //TODO: Calculate all filters at beginning
    //TODO: Make del icon change colors like titlebar


    delTask.appendChild(delTaskIcon);

    task.append(taskText, delTask);
    column.appendChild(task);
}

function removeColumn(column) {
    //TODO: Add way to restore column
    column.remove();
    setColumnWidths();
}

function getClosestTask(col, x, y) {
    let closestOffset = Number.NEGATIVE_INFINITY;
    let closestTask = null;

    const tasks = document.getElementsByClassName("task");
    for (const task of tasks) {
        if (col !== task.parentNode) {
            continue;
        }

        const box = task.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    }

    return closestTask;
}

function setColumnWidths() {
    const board = document.getElementById("board");
    const columns = document.getElementsByClassName("col");
    for (let column of columns) {
        column.style.width = board.clientWidth / columns.length + "px";
        column.style.maxWidth = column.style.width;
        column.style.minWidth = column.style.maxWidth;
    }
}

// This function is my own
function colorToFilter(colorStr /* "rgb(r, g, b)" */) {
    //get rgb of element (color we are trying to emulate)
    const rgbArr = colorStr.slice(4, -1).split(",");
    const r = parseInt(rgbArr[0]);
    const g = parseInt(rgbArr[1]);
    const b = parseInt(rgbArr[2]);

    //turn color into filter params
    let color = new Color(r, g, b);
    let solver = new Solver(color);
    const ans = solver.solve().filter;
    return ans.slice(8, -1);
}

addListeners();

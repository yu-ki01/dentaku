const calculator = document.querySelector('.calculator');
const keys = calculator.querySelector('.calculator-keys');
// ディスプレイ要素の参照を新しいものに変更
const historyDisplay = calculator.querySelector('.calculator-history');
const currentDisplay = calculator.querySelector('.calculator-current-display');

let displayValue = '0'; // 現在表示されている値（下段）
let firstOperand = null; // 最初のオペランド
let operator = null; // 選択された演算子
let waitingForSecondOperand = false; // 2つ目のオペランドの入力を待っている状態
let historyString = ''; // 計算過程の文字列（上段）

function updateDisplay() {
    currentDisplay.textContent = displayValue;
    historyDisplay.textContent = historyString; // 計算過程も更新
}

keys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) {
        return;
    }

    const value = target.value;

    if (target.classList.contains('operator')) {
        handleOperator(value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('decimal')) {
        inputDecimal(value);
        updateDisplay();
        return;
    }

    if (target.classList.contains('all-clear')) {
        resetCalculator();
        updateDisplay();
        return;
    }

    inputDigit(value);
    updateDisplay();
});

function inputDigit(digit) {
    if (waitingForSecondOperand === true) {
        // 演算子を押した後に数字を入力した場合、新しい数値を開始
        displayValue = digit;
        waitingForSecondOperand = false;
    } else {
        // 0の初期状態または前の数字に連結
        displayValue = displayValue === '0' ? digit : displayValue + digit;
    }
    // 入力された数字を履歴に追加 (演算子が選択されていない場合)
    if (!operator) {
        historyString = displayValue;
    }
}

function inputDecimal(dot) {
    if (waitingForSecondOperand === true) {
        // 演算子を押した後に小数点を入力した場合、'0.'を開始
        displayValue = '0.';
        waitingForSecondOperand = false;
        historyString += '0.'; // 履歴にも追加
        return;
    }

    if (!displayValue.includes(dot)) {
        displayValue += dot;
        historyString += dot; // 履歴にも追加
    }
}

function handleOperator(nextOperator) {
    const inputValue = parseFloat(displayValue);

    // 既に演算子が選択されていて、新しい数値を待っている状態の場合
    if (operator && waitingForSecondOperand) {
        operator = nextOperator; // 演算子を更新
        // 履歴の最後の演算子を置き換える
        if (historyString.endsWith('+') || historyString.endsWith('-') ||
            historyString.endsWith('*') || historyString.endsWith('/') ||
            historyString.endsWith('=')) {
            historyString = historyString.slice(0, -1) + nextOperator;
        } else {
            historyString += nextOperator;
        }
        return;
    }

    // 最初のオペランドがまだ設定されていない場合
    if (firstOperand === null && !isNaN(inputValue)) {
        firstOperand = inputValue;
        historyString = displayValue + nextOperator; // 履歴に最初の数と演算子を追加
    } else if (operator) {
        // 2つ目のオペランドと演算子があれば計算
        const result = calculate(firstOperand, inputValue, operator);
        displayValue = String(result); // 結果を下段に表示
        firstOperand = result; // 結果を次の計算の最初のオペランドとする

        if (nextOperator === '=') {
            historyString += inputValue + nextOperator + result; // 最後のイコールと結果も履歴に
        } else {
            historyString += inputValue + nextOperator; // 2つ目の数と演算子を履歴に
        }
    }

    waitingForSecondOperand = true; // 次の入力は新しい数値
    operator = nextOperator; // 演算子を更新
}

function calculate(first, second, op) {
    if (op === '+') {
        return first + second;
    }
    if (op === '-') {
        return first - second;
    }
    if (op === '*') {
        return first * second;
    }
    if (op === '/') {
        if (second === 0) {
            alert('0で割ることはできません！'); // 0除算の警告
            return 0; // またはInfinity, NaNなど適切に処理
        }
        return first / second;
    }
    return second; // イコール記号の場合など
}

function resetCalculator() {
    displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    historyString = ''; // 履歴もクリア
}

// 初期表示
updateDisplay();

class LineNumber {
    constructor (lineCount){
        for (let i = 1; i <= lineCount; i++) {
            let divLineNumber = document.createElement('div');
            divLineNumber.className = 'line-number';
            divLineNumber.textContent = i;
            document.getElementById('line-number').appendChild(divLineNumber);
        }
    }
    adjust(newValue){
        let currentValue = parseInt(document.getElementById('line-number').lastChild.textContent);
        for (let i = currentValue + 1; i <= currentValue + Math.abs(currentValue - newValue); i++) {
            if (newValue > currentValue){
                let divLineNumber = document.createElement('div');
                divLineNumber.className = 'line-number';
                divLineNumber.textContent = i;
                document.getElementById('line-number').appendChild(divLineNumber);
            }
            else{
                document.getElementById('line-number').removeChild(document.getElementById('line-number').lastElementChild);
            }
        }
    }
}
export class LineNumber {
    constructor (lineCount:number){
        for (let i = 1; i <= lineCount; i++) {
            let divLineNumber = document.createElement('div');
            divLineNumber.className = 'line-number';
            divLineNumber.textContent = String(i);
            document.getElementById('line-number').appendChild(divLineNumber);
        }
    }
    adjust(newValue:number){
        let currentValue = parseInt(document.getElementById('line-number').lastChild.textContent);
        for (let i = currentValue + 1; i <= currentValue + Math.abs(currentValue - newValue); i++) {
            if (newValue > currentValue){
                let divLineNumber = document.createElement('div');
                divLineNumber.className = 'line-number';
                divLineNumber.textContent = String(i);
                document.getElementById('line-number').appendChild(divLineNumber);
            }
            else{
                document.getElementById('line-number').removeChild(document.getElementById('line-number').lastElementChild);
            }
        }
    }
    getByNumber(number: number){
        return <HTMLElement>document.getElementsByClassName('line-number').item(number);
    }
    addNumber(){
        let el = document.createElement('div');
        el.className = 'line-number';
        el.textContent = (document.getElementsByClassName('line-number').length + 1).toString();
        document.getElementById('line-number').appendChild(el);
    }
}

let storage:number[] = []  
function qualityAirConcept (values:number[]) {
    const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
    for(let i = 0; i<=400;i++){
        if(i === Math.round(max)){
            if(i >= 0 && i<=40){
                return 'Boa'
            }
            else if(i>= 41 && i<=80){
                return 'Moderada'
            }
            else if(i>= 81 && i<= 120){
                return 'Ruim'
            }
            else if(i>= 121 && i<= 200){
                return 'Muito Ruim'
            }
            else if(i>=201 && i<= 400){
                return 'Péssima'
            }
        }
    }

}
function index(nameSensor:string,valueC:number) {
        if(nameSensor === 'CO_MQ9_Level'  || nameSensor === 'CO_MQ135_Level'){
            for(let i = 0; i<= 50; i++) {
                if(i === valueC){
                    if(i >= 0 && i<=9){
                       return [[0,40],[0,9]] 
                    }
                    else if (i > 9 && i<=11){
                        return [[41,80],[9,11]]
                    }
                    else if(i>11 && i<=13){
                        return [[81,120],[11,13]]
                    }
                    else if(i > 13 && i<=15){
                        return [[121,200],[13,15]]
                    }
                    else if(i>15 && i<=50){
                        return [[201,400],[15,50]]
                    }
                }    
            }
        }
}

export function  calcIQAR (nameSensor:string,valueSensor:number){  
     
    if(nameSensor === 'CO_MQ9_Level'  || nameSensor === 'CO_MQ135_Level') {
        let roundValueCO =  Math.round(valueSensor)
        console.log(roundValueCO)
        let indexAndConcentration  =  index(nameSensor,roundValueCO)
        if(indexAndConcentration){
            let calcForm = indexAndConcentration[0][0] + ((indexAndConcentration[0][1]  - indexAndConcentration[0][0])/(indexAndConcentration[1][1] - indexAndConcentration[1][0])) * (roundValueCO - indexAndConcentration[1][0] )
            storage.push(calcForm)
            console.log(indexAndConcentration)
            console.log(calcForm)
            console.log(storage)
            let qualityAir = qualityAirConcept(storage)
            if(storage.length > 1){
                storage = []
                console.log(qualityAir)
                return qualityAir
            }
            
        }
    
    }
    
}
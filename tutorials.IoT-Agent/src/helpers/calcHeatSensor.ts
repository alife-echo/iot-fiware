

const qualityLabels = ['Cuidado', 'Cuidado extremo', 'Perigo', 'Perigo extremo'];

const temperature = [27,28,29,30,31,32,33,34,36,37,38,39,40,41,42,43]

const relativeHumidity = [40,45,50,55,60,65,70,75,80,85,90,95,100]


function targetConcept(temp:number,rh:number){
    if((Math.round(temp) === 27 && (rh>=40 && rh <=100)) || (Math.round(temp) === 28 && (rh>=40 && rh<=85)) || (Math.round(temp) === 29 && (rh>=40 && rh <= 70)) || (Math.round(temp) === 30 && (rh>=40 && rh <=55))||(Math.round(temp) === 31 && (rh<=40 && rh>=40 && rh<=45))){
        return qualityLabels[0]
    }
    else if((Math.round(temp) === 28 && (rh>=90 && rh<=100)) || (Math.round(temp) === 29 && (rh>=75 && rh<=100)) || (Math.round(temp) === 30 && (rh>=60 && rh<=85)) || (Math.round(temp) === 31 && (rh>=50 && rh<=75)) || (Math.round(temp) === 32 && (rh>=40 && rh<=65)) || (Math.round(temp) === 33 && (rh>=40 && rh<=55))||(Math.round(temp) === 34 && (rh>=40 && rh<=50))||(Math.round(temp) === 36 && rh <= 40)){
        return qualityLabels[1]
    }
    else if((Math.round(temp) === 30 && (rh>=90 && rh<=100))|| (Math.round(temp) === 31 && (rh>=80 && rh<=100)) || (Math.round(temp) === 32 && (rh>=70 && rh<=90))|| (Math.round(temp) === 33 && (rh>=60 && rh<=80)) || (Math.round(temp) === 34 && (rh>=55 && rh<=75)) || (Math.round(temp) === 36 && (rh>=45 && rh<=65))||(Math.round(temp) === 37 && (rh>=40 && rh<=60))||(Math.round(temp) === 38 && (rh>=40 && rh<=55))||(Math.round(temp) === 39 && (rh>=40 && rh<=50))||(Math.round(temp) === 40 && (rh>=40 && rh<=45))|| (Math.round(temp) === 41 && rh <= 40)){
        return qualityLabels[2]
    }
    else{
        return 'Não encontrado'
    }
}
console.log(targetConcept(41,40))
function formatData(data:string){
    data.split(',').map(current => {return current.split('|')}).forEach(element => {
        //console.log(element[0],element[1])
        console.log(element[0],element[1])
    });       
}
require("dotenv").config()

// fetch('https://assessment.ksensetech.com/api/patients', {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': process.env.YOUR_API_KEY
//     },
// })
//     .then(response => response.json())
//     .then(data => {
//         console.log('PATIENT DATA:', data.data);
// });

async function getAlertList() {
    all = false;
    let alertList = {
        high_risk_patients: [],
        fever_patients: [],
        data_quality_issues: []
    };

    let inc = 0;
    
    let page = 1;
    while(!all) {
        

        await fetch(`https://assessment.ksensetech.com/api/patients?limit=20&page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.YOUR_API_KEY
            },
        })
            .then(response => response.json())
            .then(data => {
                // console.log(`PAGE ${page}`);
                // console.log(data)
                
                data.data.forEach(element => {
                    inc++;
                    if(!validateDataQual(element)) {
                        alertList.data_quality_issues.push(element.patient_id);
                    }

                    // console.log(element);
                    try{
                        if(totalRiskScore(element.blood_pressure, element.temperature, element.age) >= 4) {
                            alertList.high_risk_patients.push(element.patient_id);
                        }
                    } catch(e) {

                    }

                    if(calcTemperatureRisk(element.temperature) > 0) {
                        alertList.fever_patients.push(element.patient_id);
                    }
                });

                if(data.pagination.hasNext){
                    page++;
                }else{
                    all = true;
                }
        });
    }

    console.log(alertList);
    console.log(`COUNT: ${inc}`)
}
function calcBloodPressureRisk(bp) {
    let score = 0;
    try {
        let bpList = bp.split('/');
        let sys = parseInt(bpList[0]);
        let dia = parseInt(bpList[1]);

        if(bpList[0].length === 0 || bpList[1].length === 0){
            score = 0;
        }
        else if(sys >= 140 || dia >= 90) { //Stage 2
            score = 3;
        }else if((sys >= 130) || (dia >= 80)){ //Stage 1
            score = 2;
        }else if((sys >= 120) || (dia >= 70)){ //Elevated
            score = 1;
        }
    }catch(error){
        // console.log(error);
        score = 0;
    }

    return score;
}

function calcTemperatureRisk(temp) {
    let score = 0;
    if(temp >= 101) {
        score = 2;
    }else if(temp>=99.6){
        score = 1;
    }

    return score;
}

function calcAgeRisk(age) {
    score = 0;
    if(age > 40) {
        score++;
    }

    if(age > 65) {
        score++;
    }

    return score;
}

function totalRiskScore(bp, temp, age) {
    return calcBloodPressureRisk(bp) + calcTemperatureRisk(temp) + calcAgeRisk(age);
}

function validateDataQual(patient) {
    // patient id, name, age, gender, bp, temp, visit, diagnosis, meds

    isValid = true;

    try {
        isValid = Number.isInteger(patient.age) && (patient.gender === 'M'|| patient.gender === "F") && Number.isFinite(patient.temperature);

        //check BP
        let bp = patient.blood_pressure.split('/');
        if(!(parseInt(bp[0]) > 0 && parseInt(bp[1])) > 0) {
            isValid = false;
        }
    } catch(e) {
        console.log(e);
        isValid = false;
    }

    return isValid;
}

getAlertList()

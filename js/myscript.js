'use strict'



let pag = 1
let x = 0
let form = 1
const preg = []
const re = []

$(document).ready(() => {

    let URLactual = window.location

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(URLactual.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    $("#wrapped").submit((e) => {

        e.preventDefault();

        const items = $("input[type='radio']:checked").length
        const inputsValue = $("input[type='radio']:checked")
        let inputAll = $("input[type='radio']")

        let type = $(`#pag${pag}`).attr('class')


        if (type === 'group_multiple') {

            let ainputs = []
            let binputs = []

            let inputs = $(`#items${pag}  input[type='radio']`)

            inputs.each(function() {
                ainputs.push($(this).attr('id'))
            })

            let sinRepetidos = ainputs.filter(function(valor, indiceActual, arreglo) {
                let indiceAlBuscar = arreglo.indexOf(valor);
                if (indiceActual === indiceAlBuscar) {
                    return true;
                } else {
                    return false;
                }
            })

            //alert(sinRepetidos)
            sinRepetidos.forEach((o) => {
                //alert($(`#${o}`).attr('id').is(':checked'))
            })



            $(`#items${pag}  input[type='radio']:checked`).each(function() {
                binputs.push($(this).attr('name'))

            })

            let array = []
            for (var i = 0; i < sinRepetidos.length; i++) {
                var igual=false
                for (var j = 0; j < binputs.length & !igual; j++) {
                    if(sinRepetidos[i] == binputs[j] )
                        igual=true
                }
                if(!igual)array.push(sinRepetidos[i])

            }
            //alert('Falta la pregunta id: '+array)
            //console.log(JSON.stringify(array))

            if(array.length > 0)
            {

                //$(`#items${pag}`).addClass('alert')

                for(let v = 0; v < array.length ; v++)
                {
                    $(`.${array[v]}`).addClass('alert')


                    //console.log('*****************************************************')
                    //console.log(array[v])
                    //console.log('*****************************************************')
                }
                return false

            } else {
                $(`#items${pag}`).removeClass('alert');

            }

            //console.log(JSON.stringify(sinRepetidos, null, '\t'))
            //console.log(JSON.stringify(binputs, null, '\t'))



        }

        if (type === 'group_single') {
            x++
            if($(`#pag${pag} input[type='radio']`).is(':checked')) {

            } else {
                $(`#items${pag}`).addClass('alert')
                $(`.message${pag}`).html('Los campos son requeridos')
                return false
            }
        }

        if (type === 'single') {

            if($(`#pag${pag} input[type='radio']`).is(':checked')) {

            } else {

                $(`#items${pag}`).addClass('alert')
                $(`.message${pag}`).html('Los campos son requeridos')
                return false
            }

        }

        var evidence = [];

        if (items > 0) {

            for (let i = 0; i < items; i++) {

                let id = inputsValue[i].id;
                //console.log(inputsValue[i].id)

                evidence.push({
                    id,
                    choice_id: inputsValue[i].value
                })

            }
            evidence.shift()
        }


        adelante()
        handleInfo(evidence)

    })

    const adelante = () => {

        $('#pag' + (pag)).hide()

        pag++
        $('#pag' + (pag)).show()



        if (pag > 1) {
            $(".back").show(500)
        }
    }

    $(".back").click(() => {

        form = 1

        if (pag > 1) {

            $('#pag' + (pag)).remove()

            --pag
            $('#pag' + (pag)).show()

        }
        $('#pag' + (pag)).show()

        if (pag === 1) {
            $(".back").hide(400)
        }

    })

    const handleInfo = (evidence) => {

        const url = form == 1 ? 'https://api.infermedica.com/covid19/diagnosis' : 'https://api.infermedica.com/covid19/triage';

        const data = {

            sex: $('input:radio[name=sex]:checked').val(),
            age: parseInt($('#age').val()),
            evidence
        };

        const settings = {
            url,
            method: "POST",
            timeout: 0,
            headers: {
                "App-Id": "1a0de1bb",
                "App-Key": "06d5e5a6973411fca6d877a8f89ea759",
                "Content-Type": ["application/json", "text/plain"],
                Model: "infermedica-es"
            },
            data: JSON.stringify(data, null, '\t'),

        }

        $.ajax(settings).then(res => {

            //console.log(res)

            if (res.should_stop != undefined && !res.should_stop) {

                res.question.items.forEach(e => {
                    preg.push({
                        'question': e.name,
                        'id': e.id
                    })
                    // console.log(preg)
                })

                if (res.question.items.length > 0) {
                    viewForm(res);
                } else {
                    form = 2;

                    handleInfo(evidence);

                }

            } else if (res.should_stop != undefined && res.should_stop) {

                form = 2;

                handleInfo(evidence);

            } else {

                //console.log(evidence)

                let datose = []

                evidence.forEach(m => {

                    preg.forEach(q => {

                        if (m.id === q.id) {
                            datose.push({
                                'id': m.id,
                                'question': q.question,
                                'choice_id': m.choice_id
                            })
                            //console.log(data.sex+'-'+data.age+'-'+m.id+'-'+q.question+'-'+m.choice_id)
                        }

                    })

                })

                let obj = {}

                datose = datose.filter(o => obj[o.id] ? false : obj[o.id] = true)

                let result = {
                    'key': `${getParameterByName('key')}`,
                    'age': data.age,
                    'sex': data.sex,
                    'evidence': datose
                }

                const finalResult = {};
                Object.keys(result)
                    .forEach(key => finalResult[key] = result[key]);
                Object.keys(res)
                    .forEach(key => finalResult[key] = res[key]);

                console.log("Resultado: " + JSON.stringify(finalResult,null, '\t'))

                $.ajax({
                    url: "https://acielcolombia.com:86/test/",
                    data:result,
                    type:"POST",
                    success: function(response){
                        console.log(JSON.stringify("response " + response));

                    }
                })

                viewMessage(res, data, finalResult)

            }

        })

        const viewForm = res => {

            $("#middle-wizard").append(`<div id="pag${pag}" class="${res.question.type}"><div class="step wizard-step">
            
                <h4 class="main_question" id="title">${res.question.text}</h4><br><br>
                <span class="message${pag}"></span>
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-12">
                        <div id="items${pag}">
                        </div>
                    </div>
                </div>`)

            res.question.items.forEach(e => {

                const options = [];

                e.choices.forEach(data => {
                    options.push(data.id);
                });

                if (res.question.type == 'group_multiple') {

                    $(`#items${pag}`).append(
                        `<div class="row ${e.id}">
                            
                                <div class="col-lg-8 col-md-8 col-sm-8 col-6">
                                    <div class="form-group radio_input">
                                        <label>${e.name}</label>
                                    </div>
                                </div>
                                
                                <div class="col-lg-4 col-md-4 col-sm-4 col-6" >
                                    <div class="form-group radio_input">
                                        <label class="container_radio ">Sí
                                            <input type="radio" id="${e.id}" name="${e.id}" value="${options[0]}" class="group_multiple">
                                            <span class="checkmark"></span>
                                        </label>
                                        <label class="container_radio">No
                                            <input type="radio" id="${e.id}" name="${e.id}" value="${options[1]}" class="group_multiple">
                                                <span class="checkmark"></span>
                                        </label>
                                    </div>
                                </div>
                
                        </div>`
                    )
                }

                if (res.question.type == 'group_single') {

                    $(`#items${pag}`).append(`
                        <div class="row">
                            <div class="col-lg-8 col-md-8 col-sm-8 col-8">
                                <div class="form-group radio_input">
                                    <label>${e.name}</label>
                                </div>
                            </div>
                            
                            <div class="col-lg-4 col-md-4 col-sm-3 col-4">
                                <div class="form-group radio_input">
                                    <label class="container_radio ">
                                        <input type="radio" id="${e.id}" name="choise[${x}]" value="${e.choices[0].id}" class="group_single">
                                            <span class="checkmark"></span>
                                    </label>
                                </div>
                            </div>
                        </div>`)
                }

                if (res.question.type == 'single') {

                    e.choices.forEach(data => {
                        options.push(data.id);
                        //console.log(options)
                    });

                    $(`#items${pag}`).append(`
                            
                            <div class="form-group">
                            
                                <label class="container_radio version_2">Sí
                                
                                    <input type="radio" id="${e.id}" name="${e.id}" value="${options[0]}" class="single">
                                    <span class="checkmark"></span>
                                </label>
                                <label class="container_radio version_2">No
                                    <input type="radio" id="${e.id}" name="${e.id}" value="${options[1]}" class="single">
                                    <span class="checkmark"></span>
                                </label>
                            </div>`

                    )
                }
            })
        }
    }

    const viewMessage = (res, data, finalResult) => {

        $("#middle-wizard").append(`
        
            <div id="pag${pag}"><div class="step wizard-step">
            
                <h4 class="main_question" id="title"><h4>${res.label}</h4><br><br>
                
                <div class="row">
                    <div class="col-lg-12 col-md-12 col-sm-12 col-12">
                    <p>${res.description}</p>
                        <div id="alarmas${pag}">
                        </div>
                    </div>
                    </div>
                    <br>
                    <div style="border:1px solid blue"> 
                        <p style="font-size:12px; color: blue;">Request : ${JSON.stringify(data, null, '\t')}</p>
                    </div>
                    <br>
                    <div style="border:1px solid red"> 
                        <p style="font-size:12px; color: red;">Response : ${JSON.stringify(res, null, '\t')}</p>
                    </div>
                    <br>
                    <div style="border:1px solid black"> 
                        <p style="font-size:12px; color: black;">FinalResult : ${JSON.stringify(finalResult, null, '\t')}</p>
                    </div>
                </div>
            </div>`)

        if (res.serious.length > 0) {

            $(`#alarmas${pag}`).append(`<p>Sí­ntomas alarmantes:</p>`);

            res.serious.forEach(e => {
                const is_emergency = e.is_emergency ? 'is_emergency' : '';
                $(`#alarmas${pag}`).append(`<li class="${is_emergency}">${e.common_name}</li>`);
            });

        }

        $(".back").hide(300)
        $(".next").hide(300)
    }

})
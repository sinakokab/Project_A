var exam = null;

var QuestionNumber = 0;
var SectionNumber = 0;
var LastReviewedFlaggedQuestion = 0;

var FlagForReview = [];

var ReviewFlaggedQuestions = false;
var ReviewIncomplete = false;

exam = {
    timer: {
        interval: null,
        seconds: 0,
        minutes: 0,
        remainderseconds: 0,
        clocktext: "",

        set_time: function(secondsgiven){
            exam.timer.seconds = secondsgiven;
            exam.timer.interval = setInterval (function() {
                exam.timer.seconds--;
                exam.timer.minutes = Math.floor(exam.timer.seconds/60); //Rounds remainder down
                exam.timer.remainderseconds = exam.timer.seconds - (exam.timer.minutes * 60); //Obtains remainder seconds via using rounded down minutes to find left over seconds

                if (exam.timer.remainderseconds < 10){
                    exam.timer.remainderseconds = "0" + exam.timer.remainderseconds; //if the remainder seconds fall below 10, places a 0 infront to preserve aesthetics
                }

                exam.timer.clocktext = exam.timer.minutes + ":" + exam.timer.remainderseconds
                $("#clock").text("Time remaining: " + exam.timer.clocktext);

                if(exam.timer.seconds <= 0) {
                    clearInterval(exam.timer.interval);
                    alert("Time has ran out");

                }
            }, 1000)  
        },

        change_time: function(secondsgiven){
            if (exam.timer.seconds == 0){
                exam.timer.set_time(secondsgiven);
            } else {
                exam.timer.seconds = secondsgiven;
            }
        },

        clear_timer: function(){
            clearInterval(exam.timer.interval);
            exam.timer.clocktext = "";
            $("#clock").text(exam.timer.clocktext);
        },
    },

    score: 0,
    stage: "",
    sections:[],
    QuestionBanks:[],

    LoadQuestionContent: function(QuestionNumberToBeUsed){
        $("#answer_buttons").empty();
        $("#statement_content").empty();
        $("#answer_explanations").empty()
        $("#answer_images").empty();
        $("#question_position").text((QuestionNumber + 1) + " of " + exam.sections[SectionNumber].Questions.length);
        $("#exam_title").text(exam.sections[SectionNumber].title[0]);

        exam.CheckIfQuestionIsFlagged();

        switch (exam.sections[SectionNumber].QuestionTypes[0]){
            case "RADIO":
                exam.LoadRadioBoxQuestionType(QuestionNumberToBeUsed);
                break;
            case "ESSAY":
                exam.LoadEssayQuestionOptionsType(QuestionNumberToBeUsed);
                break;
        }

        console.log("Question Type - " + exam.sections[SectionNumber].QuestionTypes[0]);
        console.log("Question Type - " + exam.sections[SectionNumber].QuestionTypes[QuestionNumberToBeUsed]);
        if (exam.sections[SectionNumber].QuestionTypes[0] != "ESSAY"){
            if (exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][0].constructor === Array){
                console.log("Question " + QuestionNumberToBeUsed + " has a 3+ layer array");
                //for (var i = 0; i <exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed].length; i++){ //this loop isn't necessary since it'll only be one value long
                    var intermediate = exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][0][0]; //statements of this type are split into text [0] and images at [1]

                    var imageintermediate = $("<img src=" + exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][1][0]+">", {
                        id: "statement_img",
                    });

                    intermediate = intermediate.split("/n");

                    for (var x=0; x < intermediate.length; x++){
                        var statement_stem = $('<p/>', {
                            text:  intermediate[x],
                            id: 'statement_stem_' + i, //Splits question text into multiple lines for readability.
                        });

                        $("#statement_content").append(statement_stem); //123 heere's some change
                    }
                    $("#statement_content").append(imageintermediate); 
                //}

                if (exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed].constructor === Array){
                    console.log("Question has a nested array");
                    $("#answer_instructions").text(exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed][0]);
                    var imageintermediate = $("<img src=" + exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed][1]+">", {  //Images stored at [1], question text at [0]
                        id: "question_img",
                    });
                    $("#answer_images").append(imageintermediate);
                } else {
                    console.log("Question only has text; no image");
                    $("#answer_instructions").text(exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed]);
                }
            } else {
                for (var i = 0; i <exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed].length; i++){
                    var intermediate = exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][i];
                    intermediate = intermediate.split("/n");
                    $("#answer_instructions").text(exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed]);

                    for (var x=0; x < intermediate.length; x++){
                        var statement_stem = $('<p/>', {
                            text:  intermediate[x],//exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][i],
                            id: 'statement_stem_' + i, //Splits question text into multiple lines for readability.
                        });

                        $("#statement_content").append(statement_stem); 
                    }
                }
            }

        }


        if (exam.stage == 'marking_review'){
            console.log("Adding explanation");

            if (exam.sections[SectionNumber].Explanation[QuestionNumberToBeUsed].constructor === Array){
                console.log("Question Explanation " + QuestionNumberToBeUsed + " has a 3+ layer array");
                for (var i = 0; i <exam.sections[SectionNumber].Explanation[QuestionNumberToBeUsed].length; i++){ //this loop isn't necessary since it'll only be one value long
                    var intermediate = exam.sections[SectionNumber].Explanation[QuestionNumberToBeUsed][0]; //statements of this type are split into text [0] and images at [1]
    
                    var imageintermediate = $("<img src=" + exam.sections[SectionNumber].Statements[QuestionNumberToBeUsed][1]+">", {
                        id: "explanation_img",
                    });
    
                    intermediate = intermediate.split("/n");
    
                    for (var x=0; x < intermediate.length; x++){
                        var statement_stem = $('<p/>', {
                            text:  intermediate[x],
                            id: 'explanation_stem_' + i, //Splits question text into multiple lines for readability.
                        });
    
                        $("#answer_explanations").append(statement_stem); //123 heere's some change
                    }
                    $("#answer_explanations").append(imageintermediate); 
                }
            }
        }

        if (QuestionNumber == 0){
            $("#previous_question_btn").hide();
        } 
    },

    SplitNewLineJSON: function(LinesToBeSplit, IDToAppend){
        var intermediate = LinesToBeSplit;
        intermediate = intermediate.split("/n");

        var statement_stem = "";
        for (var x=0; x < intermediate.length; x++){
            statement_stem = $('<p/>', {
                text:  intermediate[x],
                id: 'statement_stem_' + x, //Splits question text into multiple lines for readability.
            });
           $(IDToAppend).append(statement_stem);
           console.log(intermediate[x]);
           console.log("Appening Statement Stem " + x + " to ID ");
        }
    },

    LoadEssayQuestionOptionsType: function(){
        //Need to hide previous and other options and simply leave the option to go to the overview before marking
        $("#question").removeClass();

        //Present a choice of 3 essay questions w/ buttons
        var EssayChoiceSelection = "";
        if (exam.sections[SectionNumber].UserChosenEssayByIndex[0] == null){
            for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                EssayChoiceSelection =` 
                    <div id="EssayChoice_${i}" class="EssayChoice">
                        <div id="EssayChoiceContent_${i}" class="EssayChoiceContent"></div>

                        <div id="${i}" class="EssayChoiceButton">Select</div>
                    </div>
                `;

                $("#statement_content").append(EssayChoiceSelection);
                exam.SplitNewLineJSON(exam.sections[SectionNumber].Questions[i], "#EssayChoiceContent_" + i);
            }

            $(".EssayChoiceButton").click (function() { //for VR radio box Qs
                exam.sections[SectionNumber].UserChosenEssayByIndex[0] = parseInt(this.id);
                exam.LoadEssayQuestionType(parseInt(this.id)); //this.id; use this to gain the index number for the question selected then run another function to load the actual EssayQuestion
            })
        } else {
            exam.LoadEssayQuestionType(exam.sections[SectionNumber].UserChosenEssayByIndex[0])
        }   
    },

    LoadEssayQuestionType: function(QuestionNumberToBeUsed){
        //Upon clicking one of the buttons, load a page to write your response w/ the essay question title above
        //Upon marking review load the essay response side by side with the modal answer response or with a tabular choice of the window view
        $("#statement_content").empty();
        var ExamPromptBox = `
        <div id='EssayQuestion_Question'></div>`;
        $("#statement_content").append(ExamPromptBox);
        exam.SplitNewLineJSON(exam.sections[SectionNumber].Questions[QuestionNumberToBeUsed], "#EssayQuestion_Question");
        $("#statement_content").append(`<p>In the actual exam, you will recieve a page of A4 to write your exam, which is around 25 lines. Try and stick to this limit in the mock exam.</p>`)

        if (exam.stage == "questions"){
            var ExamAnswerBox = `
            <div id="EssayAnswerBoxInput">
                <textarea id="ExamTextInput" class="ExamTextInput" placeholder="Enter Your Answer" rows="25"></textarea>
            </div>
            `
            $("#statement_content").append(ExamAnswerBox);

        } else if (exam.stage == "marking_review") {
            var ExamAnswerBox = `
            <div id="EssayAnswerBoxInput_Review">
                <p class="ExamTextTitle">Your Answer</p>
                <textarea id="ExamTextInput_Review" class="ExamTextInput"></textarea>
            </div>

            <div id="EssayAnswerBoxInput_Exemplar">
                <p class="ExamTextTitle">Exemplar</p>
                <textarea id="ExamTextInput_Exemplar" class="ExamTextInput"></textarea>
            </div>

            
            `

            $("#statement_content").append(ExamAnswerBox);

            var Explanation_Intermediate = exam.sections[SectionNumber].Explanation[[QuestionNumberToBeUsed]];
            Explanation_Intermediate = Explanation_Intermediate.replaceAll('/n',`
`);
            $("#ExamTextInput_Exemplar").val(Explanation_Intermediate);
        }

        if (exam.sections[SectionNumber].UserChosenAnswerByID[QuestionNumberToBeUsed] != ""){
            var intermediate = exam.sections[SectionNumber].UserChosenAnswerByID;
            console.log(intermediate);
            console.log("123");
            intermediate = intermediate.replaceAll('/n',`
`);

            if (exam.stage == "questions"){
                $("#ExamTextInput").val(intermediate);
            } else if (exam.stage == "marking_review"){
                $("#ExamTextInput_Review").val(intermediate);
            }
        }
    },
    

    LoadRadioBoxQuestionType: function(QuestionNumberToBeUsed){
        $("#question").removeClass().addClass("layout_vertical_split");

        var ClassToBeAdded = [];

        if (exam.stage == 'marking_review'){
            for (var x = 0; x < exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed].length; x++){             
                if (exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed][x]== exam.sections[SectionNumber].Answers[QuestionNumberToBeUsed]){
                    ClassToBeAdded[x] = 'CORRECT';
                } else {
                    ClassToBeAdded[x] = 'INCORRECT';
                }
            }           
        }

        var AnswerItems = ''
        for (var i = 0; i < exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed].length; i++){
            var AnswerLetter = "";
            var CheckedOrNot = "";

            switch (i){ //Used to generate A, B, C extrea answers for multiple choice questions
                case 0: 
                    AnswerLetter = "A";
                    break;
                case 1:
                    AnswerLetter = "B";
                    break;
                case 2:
                    AnswerLetter = "C";
                    break;
                case 3:
                    AnswerLetter = "D";
                    break;
                case 4:
                    AnswerLetter = "E";
                    break;
                case 5:
                    AnswerLetter = "F";
                    break;
                case 6:
                    AnswerLetter = "G";
                    break;
                case 7:
                    AnswerLetter = "H";
                    break;
            }
            
            
            if (exam.sections[SectionNumber].UserChosenAnswerByID[QuestionNumberToBeUsed] != null){
                CheckedOrNot = "checked";  
            } 

            var imageintermediate = ""; // Still needs to be declared otherwise the program is gonna throw an error if a variable that doesn't exist is referenced
            if (exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed][i].constructor === Array){ //Checks if the array has another array; this only happens if there's an image and text, otherwise there's just text
                console.log("Potential answer " + i + " has an image attached");
                var AnswerText = exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed][i][0]; //[0] stores answer option text [1] stores the image base64
                var imageintermediatepresentcheck = "Image_Present"; //Allows CSS to be selective in order to avoid constant margins
                imageintermediate =exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed][i][1];
            } else {
                var AnswerText = exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed][i];
                var imageintermediatepresentcheck = "Not_Present";
            }

            if (exam.stage == 'marking_review'){
                AnswerItems += `
                <li class = "marking_li_radio">
                    <label>
                        <input type="radio" name="question-${QuestionNumberToBeUsed}" id="answer ${i}" ${CheckedOrNot}>
                        ${AnswerLetter} - 
                        ${AnswerText}
                    </label>
            
                    <div id="${ClassToBeAdded[i]}" class="CorrectIncorrectLabel"> ${ClassToBeAdded[i]} </div>
                </li> 

                <img src="${imageintermediate}" id="statement_img" class="${imageintermediatepresentcheck}">
            `
            } else if (exam.stage == 'questions'){
                AnswerItems += `
                <li class = "marking_li_radio">
                    <label>
                        <input type="radio" name="question-${QuestionNumberToBeUsed}" id="answer ${i}" ${CheckedOrNot}>
                        ${AnswerLetter} - 
                        ${AnswerText}
                    </label>
                </li> 

                <img src="${imageintermediate}" id="statement_img" class="${imageintermediatepresentcheck}">
                `
            }
        }
        $("#answer_buttons").append(AnswerItems); //Answer items div is used to contain buttons to answer the multiple choice questions

        $("input:radio").click (function() { //for VR radio box Qs
            for (var i = 0; i < exam.sections[SectionNumber].PotentialAnswers[QuestionNumberToBeUsed].length; i++){
                if (this.id.includes(i)){
                    exam.sections[SectionNumber].UserChosenAnswerByID[QuestionNumberToBeUsed] = i; //Attaches a button to each radiobox that saves selected answer
                }
            }
        })
    },

    LoadStage: function(){
        switch (exam.stage){
            case "intro":
                $("#review_all_btn").hide();
                $("#review_incomplete_btn").hide();
                $("#review_flagged_btn").hide();
                $("#end_review_btn").hide();
                $("#end_marking_btn").hide();
                $("#review_screen_btn").hide();
                $("#return_marking_overview_btn").hide();

                var intermediate = exam.sections[SectionNumber].SectionIntro[0]; // this exam intro text needs to be changed to static exam intro text
                intermediate = intermediate.split("/n");
                console.log(intermediate);

                for (var i = 0; i<intermediate.length; i++){
                    $("#statement_content").append(intermediate[i]);
                }

                break;

            case "section_intro":
                $("#statement_content").empty()

                $("#review_all_btn").hide();
                $("#review_incomplete_btn").hide();
                $("#review_flagged_btn").hide();
                $("#review_screen_btn").hide();
                $("#end_review_btn").hide();

                $("#previous_question_btn").show();
                $("#next_question_btn").show();
                $("#end_exam_btn").show();

                $("#exam_title").text(exam.sections[SectionNumber].title[0]);

                var intermediate = exam.sections[SectionNumber].SectionIntro[0]; // this exam intro text needs to be changed to static exam intro text
                intermediate = intermediate.split("/n");
                console.log(intermediate);

                for (var i = 0; i<intermediate.length; i++){
                    $("#statement_content").append(intermediate[i]);
                }

                break;

            case "questions":

                $("#review_all_btn").hide();
                $("#review_incomplete_btn").hide();
                $("#review_flagged_btn").hide();
                $("#end_review_btn").hide();

                $("#review").remove();

                $("#previous_question_btn").show();
                $("#next_question_btn").show();
                $("#end_exam_btn").show();

                $("#statement_content").empty()

                exam.LoadQuestion();
                break;

            case "review":
                $("#question").removeClass();

                $("#answer_buttons").empty();
                $("#statement_content").empty();
                $("#answer_images").empty();

                $("#previous_question_btn").hide();
                $("#next_question_btn").hide();
                $("#end_exam_btn").hide();
                $("#review_screen_btn").hide();

                $("#question_position").text("");
                $("#answer_instructions").text("");

                $("#review_all_btn").show();
                $("#review_incomplete_btn").show();
                $("#review_flagged_btn").show();
                $("#end_review_btn").show();
                
                //Useless for EsQ
                var content = ` 
                <div id="review">
                <p id="review_instructions">
                    Below is a summary of your answers. You can review your questions in three (3) different ways. <br> <br>    
                    The buttons in the lower right-hand corner correspond to these choices: <br>
                    1. Review all of your questions and answers. <br>
                    2. Review questions that are incomplete. <br> 
                    3. Review questions that are flagged for review. <br> <br>
                    You may also click on a question number to link directly to its location in the exam. <br>
                </p>
                
                    <table id="review_table">
                        <tbody>`;

                var x = 0;
                if (exam.sections[SectionNumber].QuestionTypes[0] != "ESSAY"){
                    for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                        var QuestionNumberForNames = i + 1; //Generates question numbers, i.e. Q1, Q2 etc
                        if (x == 3){ //Generates row for each 3 review blocks
                            x = 1;
                            content += `</tr>
                                        <tr>
                                            <td id="${i}" class="question_review_td">
                                                <span class="review_question_link" id=${i}>Question ${QuestionNumberForNames}</span>
                                            </td>
                            `   
                        } else { 
                            x += 1;
                            content += `<td id="${i}" class="question_review_td">
                                            <span class="review_question_link" id=${i}>Question ${QuestionNumberForNames}</span>
                                        </td>
                            `
                        }
                    }

                    content += `
                            </tbody>
                        </table>
                    </div>
                    `
                } else if (exam.sections[SectionNumber].QuestionTypes[0] == "ESSAY"){
                    console.log(exam.sections[SectionNumber].UserChosenEssayByIndex[0]);
                    QuestionNumberEssayTable = parseInt(exam.sections[SectionNumber].UserChosenEssayByIndex) + 1;
                    content += `<td id="${i}" class="question_review_td">
                    <span class="review_question_link" id=${exam.sections[SectionNumber].UserChosenEssayByIndex[0]}>Question ${QuestionNumberEssayTable}</span>
                        </td>
                        </tbody>
                        </table>
                    </div>
                    `
                }

                $("#exam_content").append(content);

                $(".review_question_link").click (function() {
                    exam.stage = "questions"; 
                    QuestionNumber = parseInt(this.id); //Generates question number to load from review block that was clicked from its text

                    $("#question").removeClass().addClass("layout_vertical_split"); //Adds split element to question page
                    $("#review").remove();

                    if (QuestionNumber > 0) {
                        $("#previous_question_btn").show();
                    }

                    $("#review_screen_btn").show();
                    $("#next_question_btn").show();

                    $("#review_all_btn").hide();
                    $("#review_incomplete_btn").hide();
                    $("#review_flagged_btn").hide();
                    $("#end_review_btn").hide();

                    var AnswerGroups = `
                    <div id="answer_instructions"></div>
                    <div id="answer_buttons"></div>`
                    $("#answers_content").append(AnswerGroups);
                    exam.LoadQuestion();
                })
                break;
            
            case "marking":
                $("#exam_content").hide();
                $("#review_all_btn").hide();
                $("#review_incomplete_btn").hide();
                $("#review_flagged_btn").hide();
                $("#end_review_btn").hide();
                $("#next_question_btn").hide();
                $("#previous_question_btn").hide();
                $("#return_marking_overview_btn").hide();

                $("#mark_exam_btn").show();
                $("#marking_container").show();
                $("#end_exam_btn").show();

                $("#marking_overview_results_container").empty();

                exam.timer.clear_timer();

                var ScoreBySection = 0;
                for (var i = 0; i < exam.sections.length; i++){

                    var SectionItems = '';
                    var ClassToBeAdded = [];
                    var QuestionNumberIncrement = 0;
                    var CorrectAnswerCount = 0;
                    
                    if (exam.sections[i].QuestionTypes[0] == "RADIO"){
                        for (var x = 0; x < exam.sections[i].Answers.length; x++){         
                            switch(exam.sections[i].QuestionTypes[0]){ // this isn't needed with the above workaround
                                case "RADIO":
                                    if (exam.sections[i].PotentialAnswers[QuestionNumberIncrement][exam.sections[i].UserChosenAnswerByID[x]]== exam.sections[i].Answers[QuestionNumberIncrement]){
                                        ClassToBeAdded[x] = 'CORRECT';
                                        CorrectAnswerCount += 1;
                                    } else {
                                        ClassToBeAdded[x] = 'INCORRECT';
                                    }
                                    QuestionNumberIncrement += 1;
                                    break;
                            }
                        } 
                    }

                    //Useless for EsQ
                    console.log(exam.sections[i].SectionName[0]);
                    SectionItems += `
                    <div id=${exam.sections[i].SectionName[0]} class="marking_section">
                        <p> ${exam.sections[i].title[0]} Questions </p>
                    </div>
                    `
                    var x = 0;
                    var QuestionNumberForNames = 0;
                    var content =  `                   
                        <table id="marking_table">
                            <tbody>`;
                    if (exam.sections[i].QuestionTypes[0] != "ESSAY"){
                        for (var y = 0; y < exam.sections[i].Questions.length; y++){
                            QuestionNumberForNames = y + 1;

                            if (x == 3){ //Generates row for each 3 review blocks
                                x = 1;
                                console.log("New TR generated");
                                content += `</tr>
                                            <tr>
                                                <td id="${i}${y}" class="${ClassToBeAdded[y]}">
                                                    <span class="mark_questionmark_link" id=${i}${y}>Question ${QuestionNumberForNames}</span>
                                                </td>`;   
                            } else { 
                                x += 1;
                                content += `<td id="${i}${y}" class="${ClassToBeAdded[y]}">
                                                <span class="mark_questionmark_link" id=${i}${y}>Question ${QuestionNumberForNames}</span>
                                            </td>`;
                            } 
                        }
                    } else {
                        QuestionNumberEssayTable = parseInt(exam.sections[SectionNumber].UserChosenEssayByIndex) + 1;
                        console.log("Essay Type @ Marking Review");
                        content += `
                            <td id="${i}${exam.sections[SectionNumber].UserChosenEssayByIndex}" class="${ClassToBeAdded[y]}">
                                <span class="mark_questionmark_link" id=${i}${y}>Question ${QuestionNumberEssayTable}</span>
                            </td>`;  
                    }
                content += `
                        </tbody>
                    </table>
                `
                
                console.log("Appending to - " + exam.sections[i].SectionName[0]);
                $("#marking_overview_results_container").append(SectionItems);
                $("#" + exam.sections[i].SectionName[0]).append(content);
                }

                $(".mark_questionmark_link").click (function() { //for VR radio box Qs
                    $("#marking_container").hide();

                    var SplitSectionNumberAndQuestionNumber = Array.from(this.id, Number); //Splits Question number and Section number which is stored in td id as XY, X = Section Number, Y = Question Number

                    SectionNumber = parseInt(SplitSectionNumberAndQuestionNumber[0]);
                    QuestionNumber = parseInt(SplitSectionNumberAndQuestionNumber[1]);
                    exam.LoadNextStage();
                })


            break;
            
            case "marking_review":
                $("#exam_content").show();
                $("#return_marking_overview_btn").show();
                $("#statement_content").empty();
                $("#review").empty();


                $("#question").removeClass().addClass("layout_vertical_split");

                exam.LoadQuestion();
                $("#review_all_btn").hide();
                $("#review_incomplete_btn").hide();
                $("#review_flagged_btn").hide();

                if (QuestionNumber > 0) {
                    $("#previous_question_btn").show();
                }
                $("#next_question_btn").show();

                break;
            }
    },

    LoadNextStage: function(){
        switch (exam.stage){
            case "intro":
                exam.stage = 'section_intro';
                exam.LoadStage();
                break;
            case "section_intro":
                exam.timer.change_time(parseInt(exam.sections[SectionNumber].Timer[0]));
                //exam.timer.set_time(parseInt(exam.sections[SectionNumber].Timer[0]));
                exam.stage = 'questions';
                exam.LoadStage();
                for (var i=0; i < exam.sections[SectionNumber].Questions.length; i++){
                    FlagForReview[i] = "FALSE";
                }
                break;
            case "questions":
                exam.stage = 'review';
                exam.LoadStage();
                break;
            case "review":
                $("#review").remove();
                if (exam.sections.length - 1 == SectionNumber){
                    exam.stage = 'marking';
                    exam.LoadStage();
                } else {
                    SectionNumber += 1;
                    exam.stage = 'section_intro';
                    QuestionNumber = 0;
                    //exam.timer.clear_timer();
                    exam.timer.change_time(parseInt(60));
                    //exam.timer.set_time(parseInt(60));
                    exam.LoadStage();
                    break;
                }
                break;
            case "marking":
                exam.stage = 'marking_review';
                exam.LoadStage();
                break;
        }
    },

    LoadQuestion: function(){
        if (exam.stage == "questions" || exam.stage == "marking_review"){
            console.log("Checking Question...");
            if (QuestionNumber <= exam.sections[SectionNumber].Questions.length - 1){
                console.log("Loading question...");
                exam.LoadQuestionContent(QuestionNumber);
            }
        }
    },

    CheckIfQuestionIsFlagged: function(){
        if (FlagForReview[QuestionNumber] == "TRUE"){
            console.log("Question is flagged");
            $("#flagreview_button").text("Unflag");
            return true;
        } else {
            $("#flagreview_button").text("Flag for review");
            console.log("Question is not flagged");
            return false;
        }
    },

    FlagQuestion: function(){
        if (exam.stage == "questions" || exam.stage == "marking_review"){
            var FlaggedOrNot = exam.CheckIfQuestionIsFlagged();

            if (FlaggedOrNot == true){
                FlagForReview[QuestionNumber] = "FALSE";
                exam.CheckIfQuestionIsFlagged();
            } else if (FlaggedOrNot == false){
                FlagForReview[QuestionNumber] = "TRUE";
                exam.CheckIfQuestionIsFlagged();
            }
        }
    },

    LoadNextQuestion: function(){

        if (ReviewFlaggedQuestions == true){
            for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                if (FlagForReview[i] == "TRUE" && LastReviewedFlaggedQuestion < i){

                    QuestionNumber = i;
                    LastReviewedFlaggedQuestion = i;
                    console.log("Loading Question " + i + " for review.");
                    exam.stage = 'questions';
                    exam.LoadStage();
                    exam.LoadQuestion();
                    $("#review_screen_btn").show();
                    return;
                }
            }
            //exam.LoadNextStage();
            ReviewFlaggedQuestions = false;
            return;
        }

        if (ReviewIncomplete == true){
            for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                switch (exam.sections[SectionNumber].QuestionTypes[0]){
                    case ("RADIO"):
                        if (exam.sections[SectionNumber].UserChosenAnswerByID[i] == null && LastReviewedFlaggedQuestion < i){
                            console.log("Question " + i + " unaswered");
                            QuestionNumber = i;
                            LastReviewedFlaggedQuestion = i;
                            exam.stage = 'questions';
                            exam.LoadStage();
                            exam.LoadQuestion();
                            $("#review_screen_btn").show();
                            return;
                        }
                        break;
                    
                }
                ReviewIncomplete = false;
                return;
            }

        }

        if (exam.stage == "questions" && QuestionNumber < exam.sections[SectionNumber].Questions.length - 1 && exam.sections[SectionNumber].QuestionTypes[0] != "ESSAY"){
            if (QuestionNumber < exam.sections[SectionNumber].Questions.length - 1){
                QuestionNumber = QuestionNumber + 1;
                exam.LoadQuestionContent(QuestionNumber);
                $("#previous_question_btn").show();
            } else {
                $("#next_question_btn").hide();
            }      
        } else if (exam.stage != "marking_review") {
            if (exam.sections[SectionNumber].QuestionTypes[QuestionNumber] == "ESSAY" && exam.stage == "questions"){
                console.log("Exam Input Area Input - ")
                var content = $('#ExamTextInput').val();
                var content = content.replace(/\n/g, '/n'); //replaceall
                console.log(content);
                console.log("123");
                exam.sections[SectionNumber].UserChosenAnswerByID = content;
            }
            exam.LoadNextStage();
        } 

        if (exam.stage == "marking_review"){
            if (QuestionNumber < exam.sections[SectionNumber].Questions.length - 1){
                QuestionNumber = QuestionNumber + 1;
                exam.LoadQuestionContent(QuestionNumber);
                $("#previous_question_btn").show();

                if (QuestionNumber == exam.sections[SectionNumber].Questions.length - 1){
                    $("#next_question_btn").hide();
                }

            } else {
                $("#next_question_btn").hide();
                $("#end_marking_btn").show();
            }
        }
    },

    OpenCalcuator: function(){
        var path = "ti-108-master/index.html";
        var strWindowFeatures = "menubar=no,location=no,resizable=no,scrollbars=no,status=yes,width=301,height=451";
        calculator_window =  window.open(path,'calculator_window', strWindowFeatures);
        
    },

    OpenScratchPad: function(){
        var path = "Scratchpad/index.html";
        var strWindowFeatures = "menubar=no,location=no,resizable=no,scrollbars=no,status=yes,width=301,height=451";
        calculator_window =  window.open(path,'scratchpad_window', strWindowFeatures);
    },

    LoadPreviousQuestion: function(){
        if (ReviewFlaggedQuestions == true){
            var FlaggedQuestionsArray = [];

            for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                if (FlagForReview[i] == "TRUE"){
                    FlaggedQuestionsArray += i;
                }
            }

            if (FlaggedQuestionsArray.indexOf(QuestionNumber) > 0){
                console.log("Loading Question - " + FlaggedQuestionsArray[FlaggedQuestionsArray.indexOf(QuestionNumber) - 1]);
                QuestionNumber = parseInt(FlaggedQuestionsArray[FlaggedQuestionsArray.indexOf(QuestionNumber) - 1]);
                LastReviewedFlaggedQuestion = QuestionNumber;
                exam.LoadQuestion();
                return;
            }   
        }

        if (ReviewIncomplete == true){
            var IncompleteQuestions = [];

            for (var i = 0; i < exam.sections[SectionNumber].Questions.length; i++){
                switch (exam.sections[SectionNumber].QuestionTypes[0]){
                    case ("RADIO"):
                        if (exam.sections[SectionNumber].UserChosenAnswerByID[i] == null){
                            IncompleteQuestions += i;
                        }
                        break;
                    
                    }
                }

            if (IncompleteQuestions.indexOf(QuestionNumber) > 0){
                console.log("Loading Question - " + IncompleteQuestions[IncompleteQuestions.indexOf(QuestionNumber) - 1]);
                QuestionNumber = parseInt(IncompleteQuestions[IncompleteQuestions.indexOf(QuestionNumber) - 1]);
                LastReviewedFlaggedQuestion = QuestionNumber;
                exam.LoadQuestion();
            } else {
                $("#previous_question_btn").hide();
            }

            return; 
        }

        if (exam.stage == "questions"){
            if (QuestionNumber > 0){
                QuestionNumber = QuestionNumber - 1;
                exam.LoadQuestionContent(QuestionNumber);
                $("#next_question_btn").show();
            } else {
                $("#previous_question_btn").hide();
            }
        } else {
            exam.LoadNextStage();
        }
    
        if (exam.stage == "marking_review"){
            if (QuestionNumber > 0){
                QuestionNumber = QuestionNumber - 1;
                exam.LoadQuestionContent(QuestionNumber);
                $("#next_question_btn").show();
            } else {
                $("#previous_question_btn").hide();
            }
        }
    },

    RequestQuestionBankNames: function(){
        const url = "https://"+location.host;
        console.log(url);
        async function FetchQuestionBanks() {
            let response = await fetch (`${url}/api/BMAT/request_questionbanks`, {
                method: 'GET',
                mode: 'no-cors',
                dataType: 'json',
            })

            let json = await response.json();
            console.log(json);
            exam.QuestionBanks = json.questionbanks;
            console.log(exam.QuestionBanks);
            exam.LoadQuestionBanks();
        }
        FetchQuestionBanks();
    },

    RequestQuestionBank: function(QuestionBankNumber, examintro_workaround){
        const url = "https://"+location.host;
        async function FetchQuestionBanks() {
            let response = await fetch (`${url}/api/BMAT/request_examdata/${QuestionBankNumber}` , {
                method: 'GET',
                mode: 'no-cors',
                dataType: 'json',
            })

            let json = await response.json();
            console.log(json);
            exam.sections = json.sections;
            console.log(exam.sections);

            if (examintro_workaround == true) {
                exam.stage = "intro";
                exam.LoadStage();
                $("#exam_title").text(exam.sections[0].title[0]);
                exam.timer.change_time(60);
                //exam.timer.set_time(60); 
            }
        }
        FetchQuestionBanks();
    },

    LoadQuestionBanks: function(){
        console.log(exam.QuestionBanks);
        console.log("Loading Question Banks");

        var QuestionBankItems = "";

        for (var i = 0; i < exam.QuestionBanks.length; i++){
            QuestionBankItems += `
            <li id="${i}">
                <label>
                    <input type="radio" name="questionbankitem" id="${i}" class="intro_radiobox">
                    ${exam.QuestionBanks[i]}
                </label>
            </li>
             `
        }
        $("#selection_container").append(QuestionBankItems);

        $("input:radio").click (function() { //for VR radio box Qs
            $("#intro_container").hide();
            $("#exam_container").show(); 
            console.log(this.id);
            exam.RequestQuestionBank(this.id, true);
        })
    },

    SetUp: function(){
        $("#next_question_btn").click (function() {
            exam.LoadNextQuestion();
        })

        $("#flagreview_button").click (function() {
            exam.FlagQuestion();
        })
        
        $("#review_flagged_btn").bind("click", function() {
            //check if there's any flagged questions; i.e. if the array is null
            if (FlagForReview.includes("TRUE")) {
                ReviewFlaggedQuestions = true;
                LastReviewedFlaggedQuestion = -1;
                console.log("Reviewing flagged questions");
                exam.LoadNextQuestion();
            } else {
                console.log("No flagged items");
            }
        })

        $("#review_incomplete_btn").bind("click", function () {
            //check if there's any incomplete questions; i.e. if the array is null
            ReviewIncomplete = true;
            LastReviewedFlaggedQuestion = -1;
            console.log("Reviewing incomplete questions");
            exam.LoadNextQuestion();
        })

        $("#review_all_btn").bind("click", function () {
            console.log("Reviewing all questions");
            exam.stage = 'questions';
            exam.LoadStage();
            QuestionNumber = 0;
            exam.LoadQuestion();
        })

        $("#previous_question_btn").bind("click", function() {
            exam.LoadPreviousQuestion();
        })

        $("#calculator_button").bind("click", function() {
            exam.OpenCalcuator();
        })

        $("#scratchpad_button").bind("click", function() {
            exam.OpenScratchPad();
        })

        $("#review_screen_btn").bind("click", function() {
            exam.LoadNextStage();
        })

        $("#end_review_btn").bind("click", function() {
            exam.LoadNextStage();
        })

        $("#end_exam_btn").bind("click", function() {
            $("#intro_container").show();

            $("#answer_instructions").text("");

            $("#answer_buttons").empty();
            $("#statement_content").empty();

            $("#exam_container").hide();
            $("#marking_container").hide();
            
            $("#question").removeClass();

            QuestionNumber = 0;
            SectionNumber = 0;
            FlagForReview = [];
            exam.stage = "intro";
        })

        $("#return_marking_overview_btn").bind("click", function() {
            exam.stage = 'marking';
            exam.LoadStage();
        })      
    },

    StartQuiz: function(){
        exam.SetUp();
        exam.RequestQuestionBankNames();

        $("#intro_container").show();
        $("#exam_container").hide();
        $("#marking_container").hide();
    },
}

function CheckLoginDetails(UserName){
    const url = "https://"+location.host;
    async function ServerLoginDetailVerification() {
        let response = await fetch (`${url}/api/BMAT/check_login`, {
            method: 'POST',
            mode: 'no-cors',
            dataType: 'json',
            body: JSON.stringify({
                "username": UserName
                }),
            })
            console.log("POST Sent");
            let json = await response.json();
            console.log(json);

            var BOOL_Check = json.valid_email;

            if (BOOL_Check == true){
                console.log('valid');
               
                $(".login-page").hide();
                $("#quiz_body").show();
                exam.StartQuiz();
            } else {
                console.log('invalid');
                $(".message").text('Invalid email');
            }
        }
    
    ServerLoginDetailVerification();
}

$(document).ready(function(){

    $("#quiz_body").hide();

    $("#LoginButton").bind("click", function() {
        console.log("BTN clicked");
        var UserName = $("#Username_Input").val();
        CheckLoginDetails(UserName);
    })

});

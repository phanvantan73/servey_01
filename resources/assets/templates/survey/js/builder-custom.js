jQuery(document).ready(function () {
    var questionSelected = null;
    var surveyData = $('#survey-data');

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    function generateId() {
        return s4() + $.now();
    }

    function refreshSectionId() {
        surveyData.data('section-id', generateId());

        return surveyData.data('section-id');
    }

    function refreshQuestionId() {
        surveyData.data('question-id', generateId());

        return surveyData.data('question-id');
    }

    function refreshAnswerId() {
        surveyData.data('answer-id', generateId());

        return surveyData.data('answer-id');
    }

    function formSortable() {
        $('.survey-form ul.sortable').sortable({
            axis: 'y',
            containment: '.content-wrapper',
            handle: '.draggable-area',
            cursor: 'move',
            classes: {
                'ui-sortable-helper': 'hightlight'
            },
            connectWith: '.page-section',
            items: '> li:not(:first)',
            forcePlaceholderSize: true,
            start: function(e, ui) {
                if (ui.item.height() > 240) {
                    ui.item.offset(ui.placeholder.offset());
                    ui.item.height(240);
                    ui.placeholder.height(240);
                } else {
                    ui.placeholder.height(ui.item.height());
                }
            },
            stop: function (event, ui) {
                $(ui.item).removeAttr('style');
            },
        });
    }

    function multipleChoiceSortable(question) {
        $(`li#${question} .multiple-choice-block`).sortable({
            axis: 'y',
            handle: '.radio-choice-icon',
            containment: `#${question} .multiple-choice-block`,
            cursor: 'move',
            items: '.choice-sortable',
            classes: {
                'ui-sortable-helper': 'hightlight'
            },
            stop: function (event, ui) {
                $(ui.item).removeAttr('style');
            },
        });
    }

    function checkboxesSortable(question) {
        $(`li#${question} .checkboxes-block`).sortable({
            axis: 'y',
            handle: '.square-checkbox-icon',
            containment: `#${question} .checkboxes-block`,
            cursor: 'move',
            items: '.checkbox-sortable',
            classes: {
                'ui-sortable-helper': 'hightlight'
            },
            stop: function (event, ui) {
                $(ui.item).removeAttr('style');
            },
        });
    }

    function setScrollButtonTop(selector, offset) {
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width > 768) {
            selector.css('top', offset);
        } else {
            selector.css('top', '');
        }
    }

    function setScrollButtonTopByScroll(selector) {
        var currentScrollTop = $(this).scrollTop();
        var elementPosition = currentScrollTop + 5;
        setScrollButtonTop(selector, elementPosition);
    }
    // validate url image
    function checkTimeLoadImage(e, t, i) {
        var o, i = i || 3e3,
            n = !1,
            r = new Image;
        r.onerror = r.onabort = function () {
            n || (clearTimeout(o), t('error'))
        }, r.onload = function () {
            n || (clearTimeout(o), t('success'))
        }, r.src = e, o = setTimeout(function () {
            n = !0, t('timeout')
        }, i)
    }

    // preview image in modal
    function setPreviewImage(src) {
        $('.img-preview-in-modal').attr('src', src);
    }

    // show messages validate in modal
    function showMessageImage(message, type) {
        $('.messages-validate-image').removeClass('hidden');
        $('.messages-validate-image').text(message);

        if (type == 'success') {
            $('.messages-validate-image').removeClass('messages-error');
            $('.messages-validate-image').addClass('messages-success');
        } else {
            $('.messages-validate-image').removeClass('messages-success');
            $('.messages-validate-image').addClass('messages-error');
        }
    }

    // check type file image
    function checkTypeImage(input) {
        var fileExtension = [
            'jpeg',
            'jpg',
            'png',
            'gif',
            'bmp',
            'svg',
        ];
        var fileName = input.name;
        var fileNameExt = fileName.substr(fileName.lastIndexOf('.') + 1);

        if ($.inArray(fileNameExt.toLowerCase(), fileExtension) == -1) {
            return false;
        }

        return true;
    }

    // validate video url, support youtube
    function validateVideoUrl(url) {
        var rulesURL = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;

        return url.match(rulesURL) ? RegExp.$1 : false;
    }

    // show messages video validate
    function showMessageVideo(message, type) {
        $('.messages-validate-video').removeClass('hidden');
        $('.messages-validate-video').text(message);

        if (type == 'success') {
            $('.messages-validate-video').removeClass('messages-error');
            $('.messages-validate-video').addClass('messages-success');
        } else {
            $('.messages-validate-video').removeClass('messages-success');
            $('.messages-validate-video').addClass('messages-error');
        }
    }

    // preview video in modal
    function setPreviewVideo(src, thumbnailVideo) {
        $('.video-preview').attr('src', src);
        $('.video-preview').attr('data-thumbnail', thumbnailVideo);
    }

    // upload image
    function uploadImage(formData, url) {
        $.ajax({
            method: 'POST',
            url: url,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
        })
        .done(function (response) {
            if (response) {
                showMessageImage(Lang.get('lang.image_preview'), 'success');
                setPreviewImage(response);
            } else {
                showMessageImage(Lang.get('lang.upload_image_fail'));
                setPreviewImage('');
            }
        })
        .fail(function (response) {
            var errors = JSON.parse(response.responseText)
            showMessageImage(errors.image);
            setPreviewImage('');
        });
    }

    // reset modal image
    function resetModalImage() {
        $('.input-url-image').val('');
        $('.messages-validate-image').text('');
        $('.img-preview-in-modal').attr('src', '');
        $('.input-upload-image').val('');
    }

    //
    function resetModalVideo() {
        $('.input-url-video').val('');
        $('.messages-validate-video').text('');
        $('.video-preview').attr('src', '');
        $('.video-preview').attr('data-thumbnail', '');
    }

    /**
     * Get survey data
     */

    // get all answers by question
    function getAnswers(data, parentElement, questionId) {
        var answers = [];

        $(parentElement).find('.element-content .option').each(function (index, element) {
            var answer = {};
            var answerId = $(element).data('answer-id');

            answer.id = answerId;

            var content = data.find(item => item.name.includes(`answer[question_${questionId}][answer_${answerId}]`));
            answer.content = content !== undefined ? content.value : '';

            var media = data.find(item => item.name.includes(`media[question_${questionId}][answer_${answerId}]`));
            answer.media = media !== undefined ? media.value : '';

            var type = 2; // Other option

            if ($(element).hasClass('choice-sortable')) {
                type = 1; // Option
            }

            answer.type = type; // 1: Option, 2: Other option

            if (!$.isEmptyObject(answer)) {
                answers.push(answer);
            }
        });

        return answers;
    }

    // get all questions by section
    function getQuestions(data, parentElement, sectionId) {
        var questions = [];

        $(parentElement).find('li.form-line.sort').each(function (index, element) {
            var question = {};
            var questionId = $(element).data('question-id');

            question.id = questionId;

            var title = data.find(item => item.name === `title[section_${sectionId}][question_${questionId}]`);
            question.title = title !== undefined ? title.value : '';

            var description = data.find(item => item.name === `description[section_${sectionId}][question_${questionId}]`);
            question.description = description !== undefined ? description.value : '';

            var media = data.find(item => item.name === `media[section_${sectionId}][question_${questionId}]`);
            question.media = media !== undefined ? media.value : '';

            var type = $(element).data('question-type');
            question.type = type;

            var require = data.find(item => item.name === `require[section_${sectionId}][question_${questionId}]`);
            question.require = require !== undefined ? parseInt(require.value) : 0; // 0: No require, 1: Require

            question.answers = getAnswers(data, element, questionId);

            if (!$.isEmptyObject(question)) {
                questions.push(question);
            }
        });

        return questions;
    }

    // get all sections
    function getSections(data) {
        var sections = [];
        $('.survey-form ul.page-section.sortable').each(function (index, element) {
            var section = {};

            var sectionId = $(element).data('section-id');
            section.id = sectionId;

            var title = data.find(item => item.name === `title[section_${sectionId}]`);
            section.title = title !== undefined ? title.value : '';

            var description = data.find(item => item.name === `description[section_${sectionId}]`);
            section.description = description !== undefined ? description.value : '';
            section.questions = getQuestions(data, element, sectionId);

            if (!$.isEmptyObject(section)) {
                sections.push(section);
            }
        });

        return sections;
    }

    function getSurvey(data = []) {
        try {
            var obj = {};

            var title = data.find(item => item.name === 'title');
            obj.title = title !== undefined ? title.value : '';

            var startTime = data.find(item => item.name === 'start_time');
            obj.start_time = startTime !== undefined ? startTime.value : '';

            var endTime = data.find(item => item.name === 'end_time');
            obj.end_time = endTime !== undefined ? endTime.value : '';

            var description = data.find(item => item.name === 'description');
            obj.description = description !== undefined ? description.value : '';

            // invited emails
            var invited_emails = [];

            obj.invited_emails = invited_emails;

            // setting
            var setting = {};

            obj.setting = setting;

            // sections
            var sections = getSections(data);
            obj.sections = sections;

            return obj;
        } catch (error) {
            return null;
        }
    }

    // change question elements
    function changeQuestion(option) {
        var currentQuestion = option.closest('li.sort');
        var questionData = currentQuestion.find('input, textarea').serializeArray();

        var sectionId = refreshSectionId();
        var questionId = refreshQuestionId();
        var questionType = option.data('type');
        var answerId = refreshAnswerId();

        if (this.questionSelected == null) {
            var endSection = $('.survey-form').find('ul.sortable').last().find('.end-section').first();
            sectionId = endSection.closest('ul.page-section.sortable').data('section-id');
        } else {
            sectionId = this.questionSelected.closest('ul.page-section.sortable').data('section-id');
        }

        $.ajax({
            method: 'POST',
            url: option.data('url'),
            data : {
                sectionId: sectionId,
                questionId: questionId,
                answerId: answerId,
            }
        })
        .done(function (data) {
            if (data.success) {
                var element = $('<div></div>').html(data.html).children().first();

                if (this.questionSelected === null) {
                    this.questionSelected = $(element).insertBefore(endSection);
                } else {
                    currentQuestion.replaceWith(element);
                    this.questionSelected = element;
                }

                this.questionSelected.find('div.survey-select-styled').
                    html(this.questionSelected.find(`ul.survey-select-options li[data-type="${questionType}"]`).html());
                this.questionSelected.click();

                // add sortable event for multiple choice
                if (questionType == 3) {
                    multipleChoiceSortable(`question_${questionId}`);
                }
                
                // add sortable event for checkboxes
                if (questionType == 4) {
                    checkboxesSortable(`question_${questionId}`);
                }
            }
        });
    }

    /**
     * Scroll to question element (question, image, video)
     */
    
    function scrollToQuestion(questionId) {
        $('.survey-form').one('click', '#question_' + questionId, function() {  
            $('html, body').animate({scrollTop: $(this).offset().top - 80}, 1200);
        });

        $('#question_' + questionId).click();
    }

    /**
     * Scroll to section
     */
    
    function scrollToSection(sectionId) {
        $('.survey-form').one('click', '#section_' + sectionId, function() {  
            $('html, body').animate({scrollTop: $(this).offset().top - 80}, 1200);
        });

        $('#section_' + sectionId).click();
    }

    /* Selecting form components*/
    $('.survey-form').on('click', 'ul.sortable li.sort', function () {
        $('.form-line').removeClass('liselected');
        $(this).addClass('liselected');
        setScrollButtonTop($('.button-group-sidebar'), $(this).position().top - 96);
        this.questionSelected = $(this);
    });

    // This is for resize window
    $(function () {
        // add new section when page loaded
        $('#add-section-btn').click();

        $(window).bind('load resize', function () {
            var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
            if (width < 1170) {
                $('body').addClass('content-wrapper');
            } else {
                $('body').removeClass('content-wrapper');
            }
        });
    });

    /* Datetimepicker */

    $('#start-time').datetimepicker();

    $('#end-time').datetimepicker();

    /**
     * Scroll button
     */

    $(window).scroll(function() {
        setScrollButtonTopByScroll($('.button-group-sidebar'));
    });

    $(window).resize(function() {
        setScrollButtonTopByScroll($('.button-group-sidebar'));
    });

    /**
     * Form sortable
     */

    formSortable();

    /**
     * Select text in the input element when focus
     */

    $('.survey-form').on('focus', '.page-section input', function (e) {
        $(this).select();
    });

    $('.content-wrapper form').on('click', '.remove-element', function (event) {
        event.preventDefault();
        $(this).closest('li').fadeOut(300).remove();
        this.questionSelected = null;
    });

    // auto resize textarea
    $.each($('textarea[data-autoresize]'), function() {
        var offset = this.offsetHeight - this.clientHeight;

        var resizeTextarea = function(el) {
            $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
        };

        $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
    });

    // dropdown menu select element
    $('.survey-form').on('click', '.survey-select-styled', function(e) {
        e.stopPropagation();
        $('.survey-select-options').hide();
        $('ul.option-menu-dropdown').hide();
        $('.section-select-options').hide();
        $('div.survey-select-styled.active').not(this).each(function() {
            $(this).removeClass('active').next('ul.survey-select-options').hide();
        });
        $(this).toggleClass('active').next('ul.survey-select-options').toggle();
    });

    $('.survey-form').on('click', '.survey-select-options li', function(e) {
        e.stopPropagation();
        $('div.survey-select-styled').html($(this).html()).removeClass('active');
        $('.survey-select-options').hide();
        $('.survey-select-styled').removeClass('active');

        // change question type and content
        changeQuestion($(this));
    });

    $(document).click(function() {
        $('.survey-select-styled').removeClass('active');
        $('.survey-select-options').hide();
    });

    // required btn
    $('.survey-form').on('click', '.question-required-checkbox label .toggle', function () {
        $(this).toggleClass('active');
        var checked = $(this).prev().attr('checked');
        $(this).prev().attr('checked', !checked);
    });

    // hide-show element block
    $('.survey-form').on('click', '.page-section .form-line', function () {
        $('.form-line').each(function () {
            $(this).removeClass('question-active');
            $(this).find('.question-input').addClass('active');
            $(this).find('.question-input').parent().addClass('col-xl-12');
            $(this).find('.element-content').removeClass('hidden');
            $(this).find('.question-description-input').removeClass('hidden');
            $(this).find('.question-description-input').addClass('active');
        });

        $(this).closest('.survey-form').find('.zoom-btn').removeClass('zoom-out-btn');
        $(this).closest('.survey-form').find('.zoom-btn').addClass('zoom-in-btn');
        $(this).addClass('question-active');
        $(this).find('.question-input').removeClass('active');
        $(this).find('.question-input').parent().removeClass('col-xl-12');
        $(this).find('.question-description-input').removeClass('active');
    });

    $('.survey-form').on('focus', '.question-input', function () {
        $(this).parent().parent().parent().click();
    });

    // survey option menu
    $('.survey-form').on('click', '.option-menu-group', function(e) {
        e.stopPropagation();
        $('.survey-select-options').hide();
        $('ul.option-menu-dropdown').hide();
        $('.section-select-options').hide();
        $(this).children('.option-menu').toggleClass('active').next('ul.option-menu-dropdown').toggle();

        return false;
    });

    $(document).click(function() {
        $('.option-menu').removeClass('active');
        $('.option-menu-dropdown').hide();
    });

    $('.survey-form').on('click', '.option-menu-dropdown li', function(e) {
        e.stopPropagation();
        $(this).children('.option-menu-selected').toggleClass('active');
        $(this).parent().hide();

        if ($(this).children('.option-menu-selected').hasClass('active')) {
            $(this).closest('li.form-line').find('.description-input').addClass('active');
        } else {
            $(this).closest('li.form-line').find('.description-input .question-description-input').val('');
            $(this).closest('li.form-line').find('.description-input .question-description-input').keyup();
            $(this).closest('li.form-line').find('.description-input').removeClass('active');
        }
    });

    $('.survey-form').on('keypress', '.question-input, .question-description-input', function(e) {
        if ((e.keyCode || e.which) === 13) {
            return false;
        }
    });

    $('.option-menu-group .option-menu-dropdown .remove-element').click(function (event) {
        event.preventDefault();
        $(this).closest('li.form-line').fadeOut(300).remove();
        this.questionSelected = null;
    });

    /**
     * multiple choice
     */

    $('.survey-form').on('keydown', '.form-line .multiple-choice-block .choice', function (e) {
        if ($(this).hasClass('other-choice-option')) {
            return;
        }

        if (e.keyCode === 13) {
            // reshow remove button when copy answer element from first element
            $(this).find('.remove-choice-option').removeClass('hidden');

            var nextElement = $(this).clone().insertAfter($(this));

            var questionElement = $(this).closest('li.form-line.sort');
            var questionId = questionElement.data('question-id');
            var answerId = refreshAnswerId();
            nextElement.data('answer-id', answerId);
            var numberOfAnswers = questionElement.data('number-answer');
            var optionId = numberOfAnswers + 1;
            nextElement.data('option-id', optionId);
            questionElement.data('number-answer', numberOfAnswers + 1);

            // remove image answer
            nextElement.find('div.image-answer').remove();

            // show image button for answer element
            nextElement.find('.upload-choice-image').removeClass('invisible');

            // change and reset input, image value, focus, select
            var image = nextElement.find('input.image-answer-hidden');
            image.attr('name', `media[question_${questionId}][answer_${answerId}][option_${optionId}]`);
            image.val('');

            var input = nextElement.find('input.form-control');
            input.attr('name', `answer[question_${questionId}][answer_${answerId}][option_${optionId}]`);
            input.val(Lang.get('lang.option', {index: nextElement.index() + 1}));
            input.select();
            input.focus();
        } else if (e.keyCode == 8 || e.keyCode == 46) {
            var currentInput = $(this).find('input');
            var previousElement = $(this).prev();

            if (!currentInput.val()) {
                if ($(this).parent().find('.choice').length > 1) {
                    $(this).fadeOut(500).remove();
                } else {
                    $(this).parent().find('.choice').find('.remove-choice-option').addClass('hidden');
                }

                // focus next element
                previousElement.find('input').select();
                // deny key action
                e.preventDefault();
            }
        }
    });

    $('.survey-form').on('click', '.form-line .multiple-choice-block .choice', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            input.select();
        }
    });

    $('.survey-form').on('blur', '.form-line .multiple-choice-block .choice', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            $(this).next().find('input').select();
        }
    });

    // remove choice option
    $('.survey-form').on('click', '.form-line .multiple-choice-block .remove-choice-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.choice.choice-sortable');

        if ($(this).closest('.multiple-choice-block').find('.choice.choice-sortable').length > 1) {
            option.fadeOut(500).remove();
        } else {
            $(this).closest('.multiple-choice-block').find('.choice.choice-sortable').find('.remove-choice-option').addClass('hidden');
        }
    });

    $('.survey-form').on('click', '.form-line .multiple-choice-block .remove-other-choice-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.choice');
        $(this).closest('.multiple-choice-block').find('.other-choice .other-choice-btn').first().show();
        option.fadeOut(500).remove();
    });

    $('.survey-form').on('click', '.form-line .multiple-choice-block .other-choice .other-choice-block .add-choice', function (e) {
        var multipleChoiceBlock = $(this).closest('.multiple-choice-block');
        var choice = $(this).closest('.multiple-choice-block').find('.choice').first();
        var nextElement;

        otherChoiceOption = multipleChoiceBlock.find('.other-choice-option');

        if (otherChoiceOption.length) {
            nextElement = choice.clone().insertBefore(otherChoiceOption);
        } else {
            nextElement = choice.clone().insertBefore($(this).closest('.other-choice'));
        }


        // reshow remove button when copy answer element from first element
        $(this).closest('li.form-line.sort').find('.remove-choice-option').removeClass('hidden');

        var questionElement = $(this).closest('li.form-line.sort');
        var questionId = questionElement.data('question-id');
        var answerId = refreshAnswerId();
        nextElement.data('answer-id', answerId);
        var numberOfAnswers = questionElement.data('number-answer');
        var optionId = numberOfAnswers + 1;
        nextElement.data('option-id', optionId);
        questionElement.data('number-answer', numberOfAnswers + 1);

        // remove image answer
        nextElement.find('div.image-answer').remove();

        // show image button for answer element
        nextElement.find('.upload-choice-image').removeClass('invisible');

        // change and reset input, image value, focus, select
        var image = nextElement.find('input.image-answer-hidden');
        image.attr('name', `media[question_${questionId}][answer_${answerId}][option_${optionId}]`);
        image.val('');

        var input = nextElement.find('input.form-control');
        input.attr('name', `answer[question_${questionId}][answer_${answerId}][option_${optionId}]`);
        input.val(Lang.get('lang.option', {index: nextElement.index() + 1}));
        input.select();
        input.focus();
    });

    $('.survey-form').on('click', '.form-line .multiple-choice-block .other-choice .other-choice-block .add-other-choice', function (e) {
        if (!$(this).closest('.multiple-choice-block').find('.other-choice-option').first().length) {
            var otherChoice = $(this).closest('.other-choice');
            var otherChoiceOption = $('#element-clone').find('.other-choice-option').clone();
            otherChoiceOption.insertBefore(otherChoice);
            otherChoice.find('.other-choice-btn').hide();
        }
    });

    /**
     * checkboxes
     */

    $('.survey-form').on('keydown', '.form-line .checkboxes-block .checkbox', function (e) {
        if ($(this).hasClass('other-checkbox-option')) {
            return;
        }

        if (e.keyCode === 13) {
            // reshow remove button when copy answer element from first element
            $(this).find('.remove-checkbox-option').removeClass('hidden');

            var nextElement = $(this).clone().insertAfter($(this));

            var questionElement = $(this).closest('li.form-line.sort');
            var questionId = questionElement.data('question-id');
            var answerId = refreshAnswerId();
            nextElement.data('answer-id', answerId);
            var numberOfAnswers = questionElement.data('number-answer');
            var optionId = numberOfAnswers + 1;
            nextElement.data('option-id', optionId);
            questionElement.data('number-answer', numberOfAnswers + 1);

            // remove image answer
            nextElement.find('div.image-answer').remove();

            // show image button for answer element
            nextElement.find('.upload-checkbox-image').removeClass('invisible');

            // change and reset input, image value, focus, select
            var image = nextElement.find('input.image-answer-hidden');
            image.attr('name', `media[question_${questionId}][answer_${answerId}][option_${optionId}]`);
            image.val('');

            var input = nextElement.find('input.form-control');
            input.attr('name', `answer[question_${questionId}][answer_${answerId}][option_${optionId}]`);
            input.val(Lang.get('lang.option', {index: nextElement.index() + 1}));
            input.select();
            input.focus();
        } else if (e.keyCode == 8 || e.keyCode == 46) {
            var currentInput = $(this).find('input');
            var previousElement = $(this).prev();

            if (!currentInput.val()) {
                if ($(this).parent().find('.checkbox').length > 1) {
                    $(this).fadeOut(500).remove();
                } else {
                    $(this).parent().find('.checkbox').find('.remove-checkbox-option').addClass('hidden');
                }

                // focus next element
                previousElement.find('input').select();
                // deny key action
                e.preventDefault();
            }
        }
    });

    $('.survey-form').on('click', '.form-line .checkboxes-block .checkbox', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            input.select();
        }
    });

    $('.survey-form').on('blur', '.form-line .checkboxes-block .checkbox', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            $(this).next().find('input').select();
        }
    });

    // remove checkbox option
    $('.survey-form').on('click', '.form-line .checkboxes-block .remove-checkbox-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.checkbox.checkbox-sortable');

        if ($(this).closest('.checkboxes-block').find('.checkbox.checkbox-sortable').length > 1) {
            option.fadeOut(500).remove();
        } else {
            $(this).closest('.checkboxes-block').find('.checkbox.checkbox-sortable').find('.remove-checkbox-option').addClass('hidden');
        }
    });

    $('.survey-form').on('click', '.form-line .checkboxes-block .remove-other-checkbox-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.checkbox');
        $(this).closest('.checkboxes-block').find('.other-checkbox .other-checkbox-btn').first().show();
        option.fadeOut(500).remove();
    });

    $('.survey-form').on('click', '.form-line .checkboxes-block .other-checkbox .other-checkbox-block .add-checkbox', function (e) {
        var checkboxBlock = $(this).closest('.checkboxes-block');
        var checkbox = $(this).closest('.checkboxes-block').find('.checkbox').first();
        var nextElement;

        otherCheckboxOption = checkboxBlock.find('.other-checkbox-option');

        if (otherCheckboxOption.length) {
            nextElement = checkbox.clone().insertBefore(otherCheckboxOption);
        } else {
            nextElement = checkbox.clone().insertBefore($(this).closest('.other-checkbox'));
        }

        // reshow remove button when copy answer element from first element
        $(this).closest('li.form-line.sort').find('.remove-checkbox-option').removeClass('hidden');

        var questionElement = $(this).closest('li.form-line.sort');
        var questionId = questionElement.data('question-id');
        var answerId = refreshAnswerId();
        nextElement.data('answer-id', answerId);
        var numberOfAnswers = questionElement.data('number-answer');
        var optionId = numberOfAnswers + 1;
        nextElement.data('option-id', optionId);
        questionElement.data('number-answer', numberOfAnswers + 1);

        // remove image answer
        nextElement.find('div.image-answer').remove();

        // show image button for answer element
        nextElement.find('.upload-checkbox-image').removeClass('invisible');

        // change and reset input, image value, focus, select
        var image = nextElement.find('input.image-answer-hidden');
        image.attr('name', `media[question_${questionId}][answer_${answerId}][option_${optionId}]`);
        image.val('');

        var input = nextElement.find('input.form-control');
        input.attr('name', `answer[question_${questionId}][answer_${answerId}][option_${optionId}]`);
        input.val(Lang.get('lang.option', {index: nextElement.index() + 1}));
        input.select();
        input.focus();
    });

    $('.survey-form').on('click', '.form-line .checkboxes-block .other-checkbox .other-checkbox-block .add-other-checkbox', function (e) {
        if (!$(this).closest('.checkboxes-block').find('.other-checkbox-option').first().length) {
            var otherCheckbox = $(this).closest('.other-checkbox');
            var otherCheckboxOption = $('#element-clone').find('.other-checkbox-option').clone();
            otherCheckboxOption.insertBefore(otherCheckbox);
            otherCheckbox.find('.other-checkbox-btn').hide();
        }
    });

    /**
     * Sidebar scroll group button
     */

    $('#add-question-btn').click(function (e) {
        e.preventDefault();

        var sectionId = refreshSectionId();
        var questionId = refreshQuestionId();
        var answerId = refreshAnswerId();

        if (this.questionSelected == null) {
            var endSection = $('.survey-form').find('ul.sortable').last().find('.end-section').first();
            sectionId = endSection.closest('ul.page-section.sortable').data('section-id');
        } else {
            sectionId = this.questionSelected.closest('ul.page-section.sortable').data('section-id');
        }

        $.ajax({
            method: 'POST',
            url: $(this).data('url'),
            data : {
                sectionId: sectionId,
                questionId: questionId,
                answerId: answerId,
            }
        })
        .done(function (data) {
            if (data.success) {
                var element = $('<div></div>').html(data.html).children().first();

                if (this.questionSelected == null) {
                    this.questionSelected = $(element).insertBefore(endSection);
                } else {
                    this.questionSelected = $(element).insertAfter(this.questionSelected);
                }

                this.questionSelected.click();

                // add sortable event for multiple choice
                multipleChoiceSortable(`question_${questionId}`);

                // scroll to question element
                scrollToQuestion(questionId);
            }
        });
    });

    $('#add-title-description-btn').click(function (e) {
        e.preventDefault();

        var sectionId = refreshSectionId();
        var questionId = refreshQuestionId();

        if (this.questionSelected == null) {
            var endSection = $('.survey-form').find('ul.sortable').last().find('.end-section').first();
            sectionId = endSection.closest('ul.page-section.sortable').data('section-id');
        } else {
            sectionId = this.questionSelected.closest('ul.page-section.sortable').data('section-id');
        }

        $.ajax({
            method: 'POST',
            url: $(this).data('url'),
            data : {
                sectionId: sectionId,
                questionId: questionId,
            }
        })
        .done(function (data) {
            if (data.success) {
                var element = $('<div></div>').html(data.html).children().first();

                if (this.questionSelected == null) {
                    this.questionSelected = $(element).insertBefore(endSection);
                } else {
                    this.questionSelected = $(element).insertAfter(this.questionSelected);
                }

                this.questionSelected.click();

                // scroll to title description element
                scrollToQuestion(questionId);
            }
        });
    });

    $('#add-section-btn').click(function (e) {
        e.preventDefault();

        var numberOfSections = surveyData.data('number-section');
        var sectionId = refreshSectionId();
        var questionId = refreshQuestionId();
        var answerId = refreshAnswerId();

        $.ajax({
            method: 'POST',
            url: $(this).data('url'),
            data : {
                numberOfSections: numberOfSections,
                sectionId: sectionId,
                questionId: questionId,
                answerId: answerId
            }
        })
        .done(function (data) {
            if (data.success) {
                var element = $('<div></div>').html(data.html).children().first();
                $('.survey-form').append(element);
                surveyData.data('number-section', numberOfSections + 1);
                $('.total-section').html(numberOfSections + 1);
                formSortable();
                $('.option-menu-group .option-menu-dropdown .remove-element').click(function (event) {
                    event.preventDefault();
                    $(this).closest('li.form-line').fadeOut(300).remove();
                    this.questionSelected = null;
                });

                element.find('li.sort').first().click();

                // add multiple sortable event
                multipleChoiceSortable(`question_${questionId}`);

                // scroll to section
                scrollToSection(sectionId);
            }
        });
    });

    // insert image to section
    $('#add-image-section-btn').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-insert-image-section" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-insert-image-section').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');
            var sectionId = 0;
            var questionId = refreshQuestionId();

            if (this.questionSelected == null) {
                var endSection = $('.survey-form').find('ul.sortable').last().find('.end-section').first();
                sectionId = endSection.closest('ul.page-section.sortable').data('section-id');
            } else {
                sectionId = this.questionSelected.closest('ul.page-section.sortable').data('section-id');
            }

            if (imageURL) {
                $.ajax({
                    method: 'POST',
                    url: url,
                    dataType: 'json',
                    data: {
                        imageURL: imageURL,
                        sectionId: sectionId,
                        questionId: questionId
                    }
                })
                .done(function (data) {
                    if (data.success) {
                        var element = data.html;

                        if (this.questionSelected == null) {
                            this.questionSelected = $(element).insertBefore(endSection);
                        } else {
                            this.questionSelected = $(element).insertAfter(this.questionSelected);
                        }

                        this.questionSelected.click();

                        // scroll to image element
                        scrollToQuestion(questionId);
                    }
                });
            } else {
                $('#modal-insert-image').modal('hide');
            }

            resetModalImage();
        });
    });

    // insert video to section
    $('#add-video-section-btn').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        $('.btn-insert-video').remove();
        $('.btn-group-video-modal').append(`
            <button class="btn btn-default btn-insert-video"
            id="btn-insert-video-section" data-dismiss="modal">${Lang.get('lang.insert_video')}</button>`)
        $('#modal-insert-video').modal('show');

        $('#btn-insert-video-section').click(function () {
            var thumbnailVideo = $('.video-preview').data('thumbnail');
            var urlEmbed = $('.video-preview').attr('src');

            if (urlEmbed) {
                var sectionId = 0;
                var questionId = refreshQuestionId();

                if (this.questionSelected == null) {
                    var endSection = $('.survey-form').find('ul.sortable').last().find('.end-section').first();
                    sectionId = endSection.closest('ul.page-section.sortable').data('section-id');
                } else {
                    sectionId = this.questionSelected.closest('ul.page-section.sortable').data('section-id');
                }

                $.ajax({
                    method: 'POST',
                    url: url,
                    dataType: 'json',
                    data: {
                        thumbnailVideo: thumbnailVideo,
                        urlEmbed: urlEmbed,
                        sectionId: sectionId,
                        questionId: questionId
                    }
                })
                .done(function (data) {
                    if (data.success) {
                        var element = data.html;

                        if (this.questionSelected == null) {
                            this.questionSelected = $(element).insertBefore(endSection);
                        } else {
                            this.questionSelected = $(element).insertAfter(this.questionSelected);
                        }

                        this.questionSelected.click();
                        $('#modal-insert-video').modal('hide');

                        // scroll to video element
                        scrollToQuestion(questionId);
                    }
                });
            } else {
                resetModalVideo();
                $('#modal-insert-video').modal('hide');
            }
        });
    });

    // add image to question
    $('.survey-form').on('click', '.question-image-btn', function (e) {
        e.preventDefault();
        var btnQuestionnImage = $(this);
        var questionInsert = $(this).closest('.form-line').find('.description-input');
        var imageQuestionHidden = $(this).closest('.form-line').find('.image-question-hidden');
        var url = $(this).data('url');
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-insert-image-question" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-insert-image-question').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');

            if (imageURL) {
                $.ajax({
                    method: 'POST',
                    url: url,
                    dataType: 'json',
                    data: {
                        imageURL: imageURL,
                    }
                })
                .done(function (data) {
                    if (data.success) {
                        var element = data.html
                        $(element).insertAfter(questionInsert);
                        $(imageQuestionHidden).val(data.imageURL);
                        $(btnQuestionnImage).addClass('hidden');
                    }
                });
            }

            $('#modal-insert-image').modal('hide');
            resetModalImage();
        });
    });

    // add image to multi choice
    $('.survey-form').on('click', '.upload-choice-image', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        var answerInsert = $(this).parent();
        var imageAnswerHidden = $(this).closest('.choice-sortable').find('.image-answer-hidden');
        var uploadChoiceTag = $(this);
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-insert-image-answer" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-insert-image-answer').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');

            if (imageURL) {
                $.ajax({
                    method: 'POST',
                    url: url,
                    dataType: 'json',
                    data: {
                        imageURL: imageURL,
                    }
                })
                .done(function (data) {
                    if (data.success) {
                        var element = data.html;
                        $(element).insertAfter(answerInsert);
                        $(imageAnswerHidden).val(data.imageURL);
                        $(uploadChoiceTag).addClass('invisible');
                        $('#modal-insert-image').modal('hide');
                    }
                });
            }

            $('#modal-insert-image').modal('hide');
            resetModalImage();
        });
    });

    // add image to checkbox
    $('.survey-form').on('click', '.upload-checkbox-image', function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        var answerInsert = $(this).parent();
        var imageAnswerHidden = $(this).closest('.checkbox-sortable').find('.image-answer-hidden');
        var uploadChoiceTag = $(this);
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-insert-image-answer" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-insert-image-answer').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');

            if (imageURL) {
                $.ajax({
                    method: 'POST',
                    url: url,
                    dataType: 'json',
                    data: {
                        imageURL: imageURL,
                    }
                })
                .done(function (data) {
                    if (data.success) {
                        var element = data.html;
                        $(element).insertAfter(answerInsert);
                        $(imageAnswerHidden).val(data.imageURL);
                        $(uploadChoiceTag).addClass('invisible');
                        $('#modal-insert-image').modal('hide');
                    }
                });
            }

            $('#modal-insert-image').modal('hide');
            resetModalImage();
        });
    });

    function removeImage(url, imageURL) {
        var regexURL = /^http+/;

        if (!regexURL.test(imageURL)) {
            $.ajax({
                method: 'POST',
                url: url,
                dataType: 'json',
                data: {
                    imageURL: imageURL.replace('/storage', 'public'),
                }
            });
        }
    }

    // remove image choice answer
    $('.survey-form').on('click', '.remove-image-answer', function () {
        var btUploadChoiceImage = $(this).closest('.choice-sortable').find('.answer-image-btn-group').children('.upload-choice-image');
        var btUploadCheckboxImage = $(this).closest('.checkbox-sortable').find('.answer-image-btn-group').children('.upload-checkbox-image');
        var inputImageChoiceHidden = $(this).closest('.choice-sortable').find('.image-answer-hidden');
        var inputImageCheckboxHidden = $(this).closest('.checkbox-sortable').find('.image-answer-hidden');

        if ($(btUploadChoiceImage).attr('class')) {
            $(btUploadChoiceImage).removeClass('hidden');
            $(inputImageChoiceHidden).val('');
        } else {
            $(btUploadCheckboxImage).removeClass('hidden');
            $(inputImageCheckboxHidden).val('');
        }

        var url = $(this).data('url');
        var imageAnswerTag = $(this).parent().children('.answer-image-url');
        var imageURL = $(imageAnswerTag).attr('src');
        removeImage(url, imageURL);
        $(this).closest('.image-answer').remove();
    });

    // show option image section
    $('.survey-form').on('click', '.option-image-section', function (e) {
        e.stopPropagation();
        var optionMenuSelected = $(this).children('.option-menu-image');
        $(optionMenuSelected).toggleClass('show');
    });

    // hide option image section
    $(document).on('click', function () {
        $('.option-menu-image').removeClass('show');
    });

    // show option image question
    $('.survey-form').on('click', '.option-image-question', function (e) {
        e.stopPropagation();
        var optionMenuSelected = $(this).children('.option-menu-image');
        $((optionMenuSelected)).toggleClass('show');
    });

    // hide option image question
    $(document).on('click', function () {
        $('.option-menu-image').removeClass('show');
    });

    // remove image question
    $('.survey-form').on('click', '.remove-image', function (e) {
        e.stopPropagation();
        var btQuestionImage = $(this).closest('.form-line').find('.question-image-btn');
        var imageQuestionTag = $(this).closest('.show-image-question').children('.image-question-url');
        var imageURL = $(imageQuestionTag).attr('src');
        var url = $(this).data('url');
        removeImage(url, imageURL);
        var imageQuestionHidden = $(this).closest('.form-line').find('.image-question-hidden');
        $(imageQuestionHidden).val('');
        $(btQuestionImage).removeClass('hidden');
        $(this).closest('.image-question').remove();
    });

    // remove image section
    $('.survey-form').on('click', '.remove-image-section', function (e) {
        e.stopPropagation();
        var imageSectionTag = $(this).closest('.box-show-image').children('.show-image-insert-section');
        var imageURL = $(imageSectionTag).attr('src');
        var url = $(this).data('url');
        removeImage(url, imageURL);
        $(this).closest('.section-show-image-insert').remove();
    });

    // show video option
    $('.survey-form').on('click', '.option-image-video', function (e) {
        e.stopPropagation();
        $(this).children('.option-menu-image').toggleClass('show');
    });

    // remove video section
    $('.survey-form').on('click', '.remove-video', function (e) {
        e.stopPropagation();
        $(this).closest('.section-show-image-insert').remove();
    });

    // change image question
    $('.survey-form').on('click', '.change-image', function (e) {
        e.stopPropagation();
        var imageQuestion = $(this).closest('.show-image-question').children('.image-question-url');
        var inputImageHidden = $(this).closest('.form-line').find('.image-question-hidden');
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-change-image-question" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-change-image-question').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');

            if (imageURL) {
                $(imageQuestion).attr('src', imageURL);
                $(inputImageHidden).val(imageURL);
            }

            resetModalImage();
            $('#modal-insert-image').modal('hide');
        });
    });

    // change image section
    $('.survey-form').on('click', '.change-image-section', function (e) {
        e.stopPropagation();
        var imageSection = $(this).closest('.box-show-image').children('.show-image-insert-section');
        var inputImageHidden = $(this).closest('.box-show-image').children('.input-image-section-hidden');
        $('.btn-insert-image').remove();
        $('.btn-group-image-modal').append(`
            <button class="btn btn-default btn-insert-image"
            id="btn-change-image-section" data-dismiss="modal">${Lang.get('lang.insert_image')}</button>`
        );
        $('#modal-insert-image').modal('show');

        $('#btn-change-image-section').click(function () {
            var imageURL = $('.img-preview-in-modal').attr('src');

            if (imageURL) {
                $(imageSection).attr('src', imageURL);
                $(inputImageHidden).val(imageURL);
            } else {
                $('#modal-insert-image').modal('hide');
            }

            resetModalImage();
        });
    });

    // change video section
    $('.survey-form').on('click', '.change-video', function (e) {
        e.stopPropagation();
        var imageVideo = $(this).closest('.box-show-image').children('.show-image-insert-section');
        var inputVideoURL = $(this).closest('.box-show-image').children('.video-section-url-hidden');
        $('.btn-insert-video').remove();
        $('.btn-group-video-modal').append(`
            <button class="btn btn-default btn-insert-video"
            id="btn-change-video-section" data-dismiss="modal">${Lang.get('lang.insert_video')}</button>`)
        $('#modal-insert-video').modal('show');

        $('#btn-change-video-section').click(function () {
            var thumbnailVideo = $('.video-preview').attr('data-thumbnail');
            var urlEmbed = $('.video-preview').attr('src');

            if (thumbnailVideo) {
                $(imageVideo).attr('src', thumbnailVideo);
                $(inputVideoURL).val(urlEmbed);
            }

            resetModalVideo();
            $('#modal-insert-video').modal('hide');
        });
    });

    $('#submit-survey-btn').click(function (e) {
        e.preventDefault();
        var dataArray = $('form.survey-form').serializeArray();
        var survey = getSurvey(dataArray);

        if (!survey) {
            return;
        }

        var data = JSON.stringify(survey);

        $.ajax({
            method: 'POST',
            url: $(this).data('url'),
            data: {
                data: data
            }
        })
        .done(function (data) {
            if (data.success) {
                console.log(data.json);
            }
        })
        .fail(function (data) {
        });
    });

    // live suggest email
    var indexActiveLi = 0; // store index of li tag is active

    $('.input-email-send').keyup(function (e) {
        var keyword = $(this).val().trim();
        var url = $(this).data('url');
        var emailsSuggested = $('input:hidden[name=emails_invite]').val();
        var emails = emailsSuggested.split(',');
        indexActiveLi = 0;

        if (keyword) {
            $.ajax({
                method: 'POST',
                url: url,
                dataType: 'json',
                data: {
                    keyword: keyword,
                    emails: emails,
                }
            })
            .done(function (data) {
                if (data.success) {
                    $('.live-suggest-email').empty();
                    data.emails.forEach(el => {
                        $('.live-suggest-email').append(`
                            <li class="email-li-item"><i class="fa fa-envelope"></i>&ensp;<span class="email-span-item">${el}</span></li>
                        `);
                    });
                    $('.live-suggest-email .email-li-item:nth-child(1)').addClass('email-li-item-active');
                    indexActiveLi = 1;
                }
            });
        } else {
            $('.live-suggest-email').empty();
        }
    });

    $(document).keydown(function (e) {
        if ($('#tab-send-mails').is(':visible')) {
            if (e.keyCode == 40) {
                e.preventDefault();
                $('.input-email-send').blur();

                if (indexActiveLi == $('.live-suggest-email').children('li').length) {
                    indexActiveLi = 0;
                    $('.live-suggest-email .email-li-item:nth-child(' + indexActiveLi + ')').removeClass('email-li-item-active');
                    $('.input-email-send').focus();
                } else {
                    indexActiveLi ++;
                    $('.live-suggest-email').find('.email-li-item').removeClass('email-li-item-active');
                    $('.live-suggest-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-active');
                }
            }

            if (e.keyCode == 38) {
                e.preventDefault();
                $('.input-email-send').blur();

                if (indexActiveLi == 0) {
                    indexActiveLi = $('.live-suggest-email').children('li').length;
                    $('.live-suggest-email').find('.email-li-item').removeClass('email-li-item-active');
                    $('.live-suggest-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-active');
                } else if (indexActiveLi == 1) {
                    $('.live-suggest-email .email-li-item:nth-child(' + indexActiveLi + ')').removeClass('email-li-item-active');
                    $('.input-email-send').focus();
                    indexActiveLi = 0;
                } else {
                    indexActiveLi --;
                    $('.live-suggest-email').find('.email-li-item').removeClass('email-li-item-active');
                    $('.live-suggest-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-active');
                }
            }

            if (e.keyCode == 13) {
                var liActive = $('.live-suggest-email').find('.email-li-item-active');
                var emailSuggest = $(liActive).children('.email-span-item').text().trim();

                if (isEmail(emailSuggest)) {
                    addLabelEmail(emailSuggest);
                } else {
                    var email = $('.input-email-send').val().trim();

                    if (isEmail(email)) {
                        addLabelEmail(email);
                    }
                }
            }
        }

        //key down show mail -- add member
        if ($('#tab-add-manager').is(':visible')) {
            if (e.keyCode == 40) {
                e.preventDefault();
                $('#input-email-member').blur();

                if (indexActiveLi == $('.live-suggest-member-email').children('li').length) {
                    indexActiveLi = 0;
                    $('.live-suggest-member-email .email-li-item:nth-child(' + indexActiveLi + ')').removeClass('email-li-item-member-active');
                    $('#input-email-member').focus();
                } else {
                    indexActiveLi++;
                    $('.live-suggest-member-email').find('.email-li-item').removeClass('email-li-item-member-active');
                    $('.live-suggest-member-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-member-active');
                }
            }

            if (e.keyCode == 38) {
                e.preventDefault();
                $('#input-email-member').blur();

                if (indexActiveLi == 0) {
                    indexActiveLi = $('.live-suggest-member-email').children('li').length;
                    $('.live-suggest-member-email').find('.email-li-item').removeClass('email-li-item-member-active');
                    $('.live-suggest-member-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-member-active');
                } else if (indexActiveLi == 1) {
                    $('.live-suggest-member-email .email-li-item:nth-child(' + indexActiveLi + ')').removeClass('email-li-item-member-active');
                    $('#input-email-member').focus();
                    indexActiveLi = 0;
                } else {
                    indexActiveLi--;
                    $('.live-suggest-member-email').find('.email-li-item').removeClass('email-li-item-member-active');
                    $('.live-suggest-member-email .email-li-item:nth-child(' + indexActiveLi + ')').addClass('email-li-item-member-active');
                }
            }

            if (e.keyCode == 13) {
                e.preventDefault();

                var liActive = $('.live-suggest-member-email').find('.email-li-item-member-active');
                var emailSuggest = $(liActive).children('.email-span-item').text().trim();

                if (isEmail(emailSuggest)) {
                    addEmailToTable(emailSuggest);
                } else {
                    var email = $('#input-email-member').val().trim();

                    if (isEmail(email)) {
                        addEmailToTable(email);
                    }
                }
            }
        }
    });

    //Setting add mail member manage survey
    if ($('.table-show-email-manager tr').length <= 1) {
        $('.table-show-email-manager').hide();
    } else {
        $('.table-show-email-manager').show();
    }

    $('#input-email-member').keyup(function (e) {
        var keyword = $(this).val().trim();
        var url = $(this).data('url');
        var emailsMember = [];
        $('.emails-member').each(function() {
            emailsMember.push($(this).text());
        });
        indexActiveLi = 0;

        if (keyword) {
            $.ajax({
                method: 'POST',
                url: url,
                dataType: 'json',
                data: {
                    keyword: keyword,
                    emails: emailsMember,
                }
            })
            .done(function (data) {
                if (data.success) {
                    $('.live-suggest-member-email').empty();
                    data.emails.forEach(el => {
                        $('.live-suggest-member-email').append(`
                            <li class="email-li-item"><i class="fa fa-envelope"></i>&ensp;<span class="email-span-item">${el}</span></li>
                        `);
                    });
                    $('.live-suggest-member-email .email-li-item:nth-child(1)').addClass('email-li-item-member-active');
                    indexActiveLi = 1;
                }
            });
        } else {
            $('.live-suggest-member-email').empty();
        }
    });

    // add email
    $('.live-suggest-email').on('click', '.email-li-item', function (e) {
        e.stopPropagation();
        var email = $(this).find('.email-span-item').text();
        addLabelEmail(email);
    });

    // add email member
    $('.live-suggest-member-email').on('click', '.email-li-item', function (e) {
        e.stopPropagation();
        var email = $(this).find('.email-span-item').text();
        addEmailToTable(email);
    });

    // remove email
    $('.div-show-all-email').on('click', '.delete-label-email', function () {
        var labelEmail = $(this).closest('.label-show-email');
        var email = $(labelEmail).data('email');
        removeEmail(email);
        $(labelEmail).remove();
        $('.input-email-send').focus();
    });

    $(document).click(function (e) {
        $('.live-suggest-email').empty();
    });

    // function common suggest email
    function addLabelEmail(email) {
        var emails = $('.emails-invite-hidden').val();
        var arrayEmail = emails.split(',');

        if (arrayEmail.length > 8) {
            $('.div-show-all-email').addClass('overflow-y-scroll');
        }

        var isExist = $.inArray(email, arrayEmail);

        if (isExist == -1) {
            arrayEmail.push(email);
            $('.div-show-all-email').append(`
                <label data-email="${email}" class="label-show-email">
                    ${email}&ensp;<i class="fa fa-times delete-label-email"></i>
                </label>
            `);
        }

        $('.emails-invite-hidden').val(arrayEmail.join());
        $('.live-suggest-email').empty();
        $('.input-email-send').val(null);
        $('.input-email-send').focus();
    }

    // function add email to table
    function addEmailToTable(email) {
        var emailsMember = [];
        $('.emails-member').each(function() {
            emailsMember.push($(this).text());
        });
        var isExist = jQuery.inArray(email, emailsMember);

        if (isExist == -1) {
            emailsMember.push(email);
            $('.table-show-email-manager tbody').append(`
                <tr>
                    <td class="emails-member">${email}</td>
                    <td class="roles-member">${Lang.get('lang.editor')}</td>
                    <td><a href="#" class="delete-member"><i class="fa fa-times"></i></a></td>
                </tr>
            `);
        }

        $('.emails-member-hidden').val(emailsMember.join());
        $('.live-suggest-member-email').empty();
        $('#input-email-member').val(null);
        $('#input-email-member').focus();

        if ($('.table-show-email-manager tr').length <= 1) {
            $('.table-show-email-manager').hide();
        } else {
            $('.table-show-email-manager').show();
        }
    }

    //function remove email member
    $('.table-show-email-manager').on('click', '.delete-member', function() {
        var selector = $(this).closest('tr');
        $(selector).remove();

        if ($('.table-show-email-manager tr').length <= 1) {
            $('.table-show-email-manager').hide();
        } else {
            $('.table-show-email-manager').show();
        }

        return false;
    });

    function removeEmail(email) {
        var emails = $('.emails-invite-hidden').val();
        var arrayEmail = emails.split(',');
        var index = jQuery.inArray(email, arrayEmail);

        if (index != -1) {
            delete arrayEmail[index];
            $('.emails-invite-hidden').val(arrayEmail.join());
        }
    }

    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        return regex.test(email);
    }

    /**
     * add Section
     */

    // section header dropdown
    $('.survey-form').on('click', '.section-select-styled', function(e) {
        e.stopPropagation();
        $('.survey-select-options').hide();
        $('ul.option-menu-dropdown').hide();
        $('.section-select-options').hide();
        $('div.section-select-styled.active').not(this).each(function() {
            $(this).removeClass('active').next('ul.section-select-options').hide();
        });
        $(this).toggleClass('active').next('ul.section-select-options').toggle();
    });

    $('.survey-form').on('click', '.section-select-options li', function(e) {
        e.stopPropagation();
        $('div.section-select-styled').html($(this).html()).removeClass('active');
        $('.section-select-options').hide();
        $('.section-select-styled').removeClass('active');
    });

    $(document).click(function() {
        $('.section-select-styled').removeClass('active');
        $('.section-select-options').hide();
    });

    // section zoom-in zoom-out btn
    $('.survey-form').on('click', '.zoom-btn', function () {
        if ($(this).hasClass('zoom-in-btn')) {
            $(this).removeClass('zoom-in-btn');
            $(this).addClass('zoom-out-btn');

            $(this).closest('.page-section').find('.form-line').each(function () {
                $(this).removeClass('liselected');
                $(this).removeClass('question-active');
                $(this).find('.question-input').addClass('active');
                $(this).find('.question-input').parent().addClass('col-xl-12');
                $(this).find('.question-description-input').addClass('hidden');
                $(this).find('.element-content').addClass('hidden');
            });
        } else {
            $(this).removeClass('zoom-out-btn');
            $(this).addClass('zoom-in-btn');

            $(this).closest('.page-section').find('.form-line').each(function () {
                $(this).find('.question-input').addClass('active');
                $(this).find('.question-input').parent().addClass('col-xl-12');
                $(this).find('.question-description-input').removeClass('hidden');
                $(this).find('.question-description-input').addClass('active');
                $(this).find('.element-content').removeClass('hidden');
            });
        }

        return false;
    });

    // insert image by url
    $('.input-url-image').on('keyup', function () {
        var urlImage = $(this).val().trim();

        if (!urlImage) {
            showMessageImage(Lang.get('lang.url_is_required'));
        } else {
            checkTimeLoadImage(urlImage, function (result) {
                if (result == 'success') { // is image url
                    setPreviewImage(urlImage);
                    showMessageImage(Lang.get('lang.image_preview'), 'success');
                } else { // timeout or not image url
                    setPreviewImage('');
                    showMessageImage(Lang.get('lang.url_is_invalid'));
                }
            });
        }
    });

    // insert image by upload from local
    $(document).on('click', '.btn-upload-image', function () {
        $('.input-upload-image').trigger('click');

        $(document).on('change', '.input-upload-image', function () {
            var formData = new FormData();
            var url = $(this).data('url');
            formData.append('image', this.files[0]);
            uploadImage(formData, url);
        });
    });

    // insert url video
    $('.input-url-video').on('keyup', function () {
        var urlVideo = $(this).val().trim();
        var videoInfo = { url: urlVideo };
        var thumbnailYoutube = 'https://img.youtube.com/vi/';
        var embedYoutube = 'https://www.youtube.com/embed/';

        if (!urlVideo) {
            showMessageVideo(Lang.get('lang.url_is_required'));
            setPreviewVideo('', '');
        } else {
            var rulesURL = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$/;

            if (urlVideo.match(rulesURL)) {
                videoInfo.type = 'video';
                videoInfo.id = RegExp.$1;
                var thumbnailVideo = thumbnailYoutube + videoInfo.id + '/hqdefault.jpg';
                videoInfo.thumbnail = thumbnailVideo;
                showMessageVideo(Lang.get('lang.video_preview'), 'success');
                var embedURLVideo = embedYoutube + videoInfo.id;
                setPreviewVideo(embedURLVideo, thumbnailVideo);
            } else {
                showMessageVideo(Lang.get('lang.url_is_invalid'));
                setPreviewVideo('', '');
            }
        }
    });

    /*
        setting survey
    */

    if ($('#confirm-reply').prop('checked')) {
        $('.setting-choose-confirm-reply').show('300');
        $('.setting-radio-request').removeAttr('disabled');
    }

    if ($('#checkbox-mail-remind').prop('checked')) {
        $('.setting-choose-confirm-reply').show('300');
        $('.setting-radio-request').removeAttr('disabled');
    }

    if ($('#limit-number-answer').prop('checked')) {
        $('.number-limit-number-answer').show('300');
    }

    //disable event enter

    $('#quantity-answer').keypress(function(event) {
        if (event.keyCode == 13) {
            event.preventDefault();
        }
    });

    $('#confirm-reply').change(function(event) {
        var check = $(this).prop('checked');

        if (check) {
            $('.setting-choose-confirm-reply').show('300');
            $('.setting-radio-request').removeAttr('disabled');
        } else {
            $('.setting-choose-confirm-reply').hide('300')
            $('.setting-radio-request').attr('disabled', true);
        }
    });

    $('#checkbox-mail-remind').change(function(event) {
        var check = $(this).prop('checked');

        if (check) {
            $('.setting-mail-remind').show('300');
            $('.radio-mail-remind').removeAttr('disabled');
        } else {
            $('.setting-mail-remind').hide('300')
            $('.radio-mail-remind').attr('disabled', true);
        }
    });

    $('#limit-number-answer').change(function(event) {
        var check = $(this).prop('checked');

        if (check) {
            $('.number-limit-number-answer').show('300');
        } else {
            $('.number-limit-number-answer').hide('300')
        }
    });

    var minAnswer = parseInt($('#quantity-answer').attr('min'));
    var maxAnswer = parseInt($('#quantity-answer').attr('max'));

    $('#btn-minus-quantity').click(function(event) {
        var quantity = parseInt($('#quantity-answer').val());

        if (!isNaN(quantity) && quantity > minAnswer) {
            $('#quantity-answer').val(--quantity);
        }

        return false;
    });

    $('#btn-plus-quantity').click(function(event) {
        var quantity = parseInt($('#quantity-answer').val());
        if (!isNaN(quantity) && quantity < maxAnswer) {
            $('#quantity-answer').val(++quantity);
        }

        return false;
    });

    $('#quantity-answer').blur(function(event) {
        if (parseInt($(this).val()) < minAnswer || parseInt($(this).val()) > maxAnswer) {
            $(this).val(minAnswer);
        }
    });

    // duplicate question
    $('.survey-form').on('click', '.copy-element', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var questionType = $(this).closest('.form-line').data('question-type');
        var cloneElement = $(this).closest('.form-line').clone();
        var sectionId = $(this).closest('ul.page-section.sortable').data('section-id');
        var questionId = refreshQuestionId();

        this.questionSelected = $(cloneElement).insertAfter($(this).closest('.form-line'));
        $(this.questionSelected).attr('id', 'question_' + questionId);
        $(this.questionSelected).data('question-id', questionId);
        $(this.questionSelected).find('.question-input').attr('name', 'title[section_' + sectionId + '][question_' + questionId + ']');
        $(this.questionSelected).find('.image-question-hidden').attr('name', 'media[section_' + sectionId + '][question_' + questionId + ']');
        $(this.questionSelected).find('.question-description-input').attr('name', 'description[section_'+ sectionId +'][question_' + questionId +']');
        $(this.questionSelected).find('.element-content .option').each(function (i, e) {
            i ++;
            var answerId = refreshAnswerId();
            $(this).data('answer-id', answerId);
            $(this).find('input[type=text]').attr('name', 'answer[question_' + questionId + '][answer_' + answerId + '][option_' + i + ']');
            $(this).find('input[type=hidden]').attr('name', 'media[question_' + questionId + '][answer_' + answerId + '][option_' + i + ']');
        });

        // select duplicating question
        this.questionSelected.click();
    });

    $('[data-toggle="tooltip"]').tooltip();
});

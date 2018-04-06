jQuery(document).ready(function () {
    /* Selecting form components*/
    $("li.sort").on('click', function () {
        $('.form-line').removeClass("liselected");
        $(this).addClass("liselected");
    });

    // This is for resize window
    $(function () {
        $(window).bind("load resize", function () {
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

    function setTop(selector) {
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width > 768) {
            var currentScrollTop = $(this).scrollTop();
            var buttonPosition = currentScrollTop + 5;
            selector.css('top', buttonPosition);
        } else {
            selector.css('top', '');
        }
    }

    $(window).scroll(function() {
        setTop($(".button-group-sidebar"));
    });

    $(window).resize(function() {
        setTop($(".button-group-sidebar"));
    });

    $('.survey-action').on('click', function (e) {
        e.preventDefault();
    });

    $("#sortable1").sortable({
        axis: 'y',
        containment: "form",
        handle: ".draggable-area",
        cursor: 'move',
        classes: {
            "ui-sortable-helper": "hightlight"
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

    $("#sortable2").sortable({
        axis: 'y',
        containment: "form",
        handle: ".draggable-area",
        cursor: 'move',
        classes: {
            "ui-sortable-helper": "hightlight"
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

    /**
     * Select text in the input element when focus
     */

    $('.page-section').on('focus', 'input', function (e) {
        $(this).select();
    });

    $('.content-wrapper form').on('click', '.remove-element', function (event) {
        event.preventDefault();
        $(this).closest('li').fadeOut(300).remove();
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
    $('.survey-select-styled').click(function(e) {
        e.stopPropagation();
        $('div.survey-select-styled.active').not(this).each(function() {
            $(this).removeClass('active').next('ul.survey-select-options').hide();
        });
        $(this).toggleClass('active').next('ul.survey-select-options').toggle();
    });

    $('.survey-select-options li').click(function(e) {
        e.stopPropagation();
        $('div.survey-select-styled').html($(this).html()).removeClass('active');
        $('.survey-select-options').hide();
        $('.survey-select-styled').removeClass('active');
    });

    $(document).click(function() {
        $('.survey-select-styled').removeClass('active');
        $('.survey-select-options').hide();
    });

    // required btn
    $('.question-required-checkbox label .toggle').click(function () {
        $(this).toggleClass('active');
        var checked = $(this).prev().attr('checked');
        $(this).prev().attr('checked', !checked);
    });

    // hide-show element block
    $('.page-section .form-line').click(function () {
        $('.form-line').each(function () {
            $(this).removeClass('question-active');
            $(this).children().children().children('.question-input').addClass('active');
            $(this).children().children().children('.question-input').parent().addClass('col-xl-12');
            $(this).children().children().children('.question-description-input').addClass('active');
        });

        $(this).addClass('question-active');
        $(this).children().children().children('.question-input').removeClass('active');
        $(this).children().children().children('.question-input').parent().removeClass('col-xl-12');
        $(this).children().children().children('.question-description-input').removeClass('active');
    });

    $('.question-input').focus(function () {
        $(this).parent().parent().parent().click();
    });

    // survey option menu
    $('.option-menu-group').click(function(e) {
        e.stopPropagation();
        $(this).children('.option-menu').toggleClass('active').next('ul.option-menu-dropdown').toggle();

        return false;
    });

    $(document).click(function() {
        $('.option-menu').removeClass('active');
        $('.option-menu-dropdown').hide();
    });

    $('.option-menu-dropdown li').click(function(e) {
        e.stopPropagation();
        $(this).children('.option-menu-selected').toggleClass('active');
        $(this).parent().hide();
        var descriptionInput = '';

        if ($(this).children('.option-menu-selected').hasClass('active')) {
            descriptionInput = $('#element-clone').find('.question-description-input').clone();
        }

        $(this).closest('li.form-line').find('.description-input').children('div').html(descriptionInput);

        $.each($('textarea[data-autoresize]'), function() {
            var offset = this.offsetHeight - this.clientHeight;

            var resizeTextarea = function(el) {
                $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
            };

            $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
        });

        $('.question-description-input').keypress(function(e) {
            if ((e.keyCode || e.which) === 13) {
                return false;
            }
        });
    });

    $('.question-input, .question-description-input').keypress(function(e) {
        if ((e.keyCode || e.which) === 13) {
            return false;
        }
    });

    $('.option-menu-group .option-menu-dropdown .remove-element').click(function (event) {
        event.preventDefault();
        $(this).closest('li.form-line').fadeOut(300).remove();
    });

    /**
     * multiple choice
     */

    $("#sortable1 .multiple-choice-block").sortable({
        axis: 'y',
        handle: ".radio-choice-icon",
        containment: "#sortable1 .multiple-choice-block",
        cursor: 'move',
        items: '.choice-sortable',
        classes: {
            "ui-sortable-helper": "hightlight"
        },
        stop: function (event, ui) {
            $(ui.item).removeAttr('style');
        },
    });

    $("#sortable2 .multiple-choice-block").sortable({
        axis: 'y',
        handle: ".radio-choice-icon",
        containment: "#sortable2 .multiple-choice-block",
        cursor: 'move',
        items: '.choice-sortable',
        classes: {
            "ui-sortable-helper": "hightlight"
        },
        stop: function (event, ui) {
            $(ui.item).removeAttr('style');
        },
    });

    $('.form-line .multiple-choice-block').on('keydown', '.choice', function (e) {
        if ($(this).hasClass('other-choice-option')) {
            return;
        }

        if (e.keyCode === 13) {
            $(this).find('.remove-choice-option').removeClass('hidden');
            var nextElement = $(this).clone().insertAfter($(this));
            var input = nextElement.find('input');
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

    $('.form-line .multiple-choice-block').on('click', '.choice', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            input.select();
        }
    });

    $('.form-line .multiple-choice-block').on('blur', '.choice', function (e) {
        var input = $(this).find('input');

        if (!input.val()) {
            input.val(Lang.get('lang.option', {index: $(this).index() + 1}));
            $(this).next().find('input').select();
        }
    });

    // remove choice option
    $('.form-line .multiple-choice-block').on('click', '.remove-choice-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.choice.choice-sortable');

        if ($(this).closest('.multiple-choice-block').find('.choice.choice-sortable').length > 1) {
            option.fadeOut(500).remove();
        } else {
            $(this).closest('.multiple-choice-block').find('.choice.choice-sortable').find('.remove-choice-option').addClass('hidden');
        }
    });

    $('.form-line .multiple-choice-block').on('click', '.remove-other-choice-option', function (e) {
        e.preventDefault();
        var option = $(this).closest('.choice');
        $(this).closest('.multiple-choice-block').find('.other-choice .other-choice-btn').first().show();
        option.fadeOut(500).remove();
    });

    $('.form-line .multiple-choice-block .other-choice .other-choice-block .add-choice').on('click', function (e) {
        var multipleChoiceBlock = $(this).closest('.multiple-choice-block');
        var choice = $(this).closest('.multiple-choice-block').find('.choice').first();
        var nextElement;

        otherChoiceOption = multipleChoiceBlock.find('.other-choice-option');

        if (otherChoiceOption.length) {
            nextElement = choice.clone().insertBefore(otherChoiceOption);
        } else {
            nextElement = choice.clone().insertBefore($(this).closest('.other-choice'));
        }

        var input = nextElement.find('input');
        input.val(Lang.get('lang.option', {index: nextElement.index() + 1}));
        input.select();
        input.focus();
    });

    $('.form-line .multiple-choice-block .other-choice .other-choice-block .add-other-choice').on('click', function (e) {
        if (!$(this).closest('.multiple-choice-block').find('.other-choice-option').first().length) {
            var otherChoice = $(this).closest('.other-choice');
            var otherChoiceOption = $('#element-clone').find('.other-choice-option').clone();
            otherChoiceOption.insertBefore(otherChoice);
            otherChoice.find('.other-choice-btn').hide();
        }
    });
});
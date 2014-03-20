
describe('Common features', function () {
    'use strict';
    
    var serviceUrl = '/some/url';

    beforeEach(function(){
        this.input = document.createElement('input');
        this.$input = $(this.input).appendTo('body');
        this.instance = this.$input.suggestions({
            serviceUrl: serviceUrl
        }).suggestions();
        
        this.server = sinon.fakeServer.create();
    });
    
    afterEach(function () {
        this.instance.dispose()
        this.$input.remove();
        this.server.restore();
    });

    it('Should initialize suggestions options', function () {
        expect(this.instance.options.serviceUrl).toEqual(serviceUrl);
        expect(this.instance.suggestionsContainer).not.toBeNull();
    });

    it('Should get current value', function () {
        this.instance.setOptions({
            lookup: [{ value: 'Jamaica', data: 'B' }]
        });

        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(this.instance.visible).toBe(true);
        expect(this.instance.currentValue).toEqual('Jam');
    });

    it('Verify onSelect callback', function () {
        var suggestion = { value: 'A', data: 'B' },
            options = {
                lookup: [suggestion],
                triggerSelectOnValidInput: false,
                onSelect: function(){}
            };
        spyOn(options, 'onSelect');
        
        this.instance.setOptions(options);
        this.input.value = 'A';
        this.instance.onValueChange();
        this.instance.select(0);

        expect(options.onSelect).toHaveBeenCalledWith(suggestion);
    });

    it('Should convert suggestions format', function () {
        this.instance.setOptions({
            lookup: ['A', 'B']
        });

        expect(this.instance.options.lookup[0].value).toBe('A');
        expect(this.instance.options.lookup[1].value).toBe('B');
    });

    it('Should use custom query parameter name', function () {
        var paramName = 'custom',
            paramValue = null;
        this.instance.setOptions({
            serviceUrl: '/test-query',
            paramName: paramName
        });

        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(this.server.requests[0].requestBody).toContain('"custom":"Jam"');
    });

    it('Should destroy suggestions instance', function () {
        var $div = $(document.createElement('div'));

        this.instance.$wrapper.appendTo($div);
        
        expect(this.$input.data('suggestions')).toBeDefined();
        expect($div.find('.suggestions-suggestions').length).toBeGreaterThan(0);
        expect($div.find('.suggestions-preloader').length).toBeGreaterThan(0);

        this.$input.suggestions('dispose');

        expect(this.$input.data('suggestions')).toBeUndefined();
        expect($div.find('.suggestions-suggestions').length).toEqual(0);
        expect($div.find('.suggestions-preloader').length).toEqual(0);
    });

    it('Should construct serviceUrl via callback function.', function () {
        this.instance.setOptions({
            ignoreParams: true,
            serviceUrl: function (query) {
                return '/dynamic-url/' + (query && encodeURIComponent(query).replace(/%20/g, "+") || '');
            }
        });

        this.input.value = 'Hello World';
        this.instance.onValueChange();

        expect(this.server.requests[0].url).toBe('/dynamic-url/Hello+World');
    });

    it('Should set width to be greater than zero', function () {
        this.instance.setOptions({
            lookup: [{ value: 'Jamaica', data: 'B' }]
        });

        this.input.value = 'Jam';
        this.instance.onValueChange();
        var width = $(this.instance.suggestionsContainer).width();

        expect(width).toBeGreaterThan(0);
    });

    it('Should call beforeRender and pass container jQuery object', function () {
        var context, elementCount;
        
        this.instance.setOptions({
            lookup: [{ value: 'Jamaica', data: 'B' }],
            beforeRender: function (container) {
                context = this;
                elementCount = container.length;
            }
        });

        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(context).toBe(this.input);
        expect(elementCount).toBe(1);
    });

    it('Should prevent Ajax requests if previous query with matching root failed.', function () {

        this.instance.setOptions({ preventBadQueries: true });
        this.input.value = 'Jam';
        this.instance.onValueChange();

        expect(this.server.requests.length).toEqual(1);
        this.server.respond('POST', serviceUrl, [
            200,
            {'Content-type':'application/json'},
            JSON.stringify({suggestions:[]})
        ]);
        
        this.input.value = 'Jama';
        this.instance.onValueChange();
        
        expect(this.server.requests.length).toEqual(1);

        this.input.value = 'Jamai';
        this.instance.onValueChange();
        
        expect(this.server.requests.length).toEqual(1);
    });

    it('Should highlight search phrase', function () {
        this.instance.setOptions({
            lookup: ['Japaneese lives in Japan and love non-japaneese']
        });

        this.input.value = 'japa';
        this.instance.onValueChange();
        
        var $item = $('.suggestions-suggestion');
            
        expect($item.length).toEqual(1);
        expect($item.html()).toContain('<strong>Japa<\/strong>neese lives in <strong>Japa<\/strong>n and love non-japaneese');
    });
    
    it('Should display default hint message above suggestions', function(){
        this.instance.setOptions({
            lookup: ['Jamaice']
        });

        this.input.value = 'jam';
        this.instance.onValueChange();
        
        var $hint = this.instance.$wrapper.find('.suggestions-hint');
            
        expect($hint.length).toEqual(1);
        expect($hint.text()).toEqual($.Suggestions.defaultHint);
    });

    it('Should display custom hint message above suggestions', function(){
        var customHint = 'This is custon hint';
        this.instance.setOptions({
            lookup: ['Jamaice'],
            hint: customHint
        });

        this.input.value = 'jam';
        this.instance.onValueChange();
        
        var $hint = this.instance.$wrapper.find('.suggestions-hint');
            
        expect($hint.length).toEqual(1);
        expect($hint.text()).toEqual(customHint);
    });

    it('Should not display any hint message above suggestions', function(){
        this.instance.setOptions({
            lookup: ['Jamaice'],
            hint: false
        });

        this.input.value = 'jam';
        this.instance.onValueChange();
        
        var $hint = this.instance.$wrapper.find('.suggestions-hint');
            
        expect($hint.length).toEqual(0);
    });

});
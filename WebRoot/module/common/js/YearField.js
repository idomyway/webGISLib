Ext.onReady(function () {
    Ext.define('Ext.ux.OnlyYearPicker', {
        xtype: 'onlyyearpicker',
        extend: 'Ext.picker.Month',

        afterRender: function () {
            this.callParent();
            this.el.setStyle({
                width: '106px',
            })
        },

        renderTpl: [
            '<div id="{id}-bodyEl" data-ref="bodyEl" class="{baseCls}-body">',
              '<div id="{id}-monthEl" data-ref="monthEl" class="{baseCls}-months" style="display: none;">',
                  '<tpl for="months">',
                      '<div class="{parent.baseCls}-item {parent.baseCls}-month">',
                          '<a style="{parent.monthStyle}" role="button" hidefocus="on" class="{parent.baseCls}-item-inner">{.}</a>',
                      '</div>',
                  '</tpl>',
              '</div>',
              '<div id="{id}-yearEl" data-ref="yearEl" class="{baseCls}-years">',
                  '<div class="{baseCls}-yearnav">',
                      '<div class="{baseCls}-yearnav-button-ct">',
                          '<a id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-prev" hidefocus="on" role="button"></a>',
                      '</div>',
                      '<div class="{baseCls}-yearnav-button-ct">',
                          '<a id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-yearnav-button {baseCls}-yearnav-next" hidefocus="on" role="button"></a>',
                      '</div>',
                  '</div>',
                  '<tpl for="years">',
                      '<div class="{parent.baseCls}-item {parent.baseCls}-year">',
                          '<a hidefocus="on" class="{parent.baseCls}-item-inner" role="button">{.}</a>',
                      '</div>',
                  '</tpl>',
              '</div>',
              '<div class="' + Ext.baseCSSPrefix + 'clear"></div>',
              '<tpl if="showButtons">',
                  '<div class="{baseCls}-buttons">{%',
                      'var me=values.$comp, okBtn=me.okBtn, cancelBtn=me.cancelBtn;',
                      'okBtn.ownerLayout = cancelBtn.ownerLayout = me.componentLayout;',
                      'okBtn.ownerCt = cancelBtn.ownerCt = me;',
                      'Ext.DomHelper.generateMarkup(okBtn.getRenderTree(), out);',
                      'Ext.DomHelper.generateMarkup(cancelBtn.getRenderTree(), out);',
                  '%}</div>',
              '</tpl>',
            '</div>'
        ]
    });

    Ext.define('Ext.form.field.Year', {
        extend: 'Ext.form.field.Date',
        alias: 'widget.yearfield',
        requires: ['Ext.picker.Month', 'Ext.ux.OnlyYearPicker'],
        alternateClassName: ['Ext.form.YearField', 'Ext.form.Year'],
        selectDate: null,
        createPicker: function () {
            var me = this,
                format = Ext.String.format,
                pickerConfig;

            pickerConfig = {
                pickerField: me,
                ownerCmp: me,
                renderTo: document.body,
                floating: true,
                hidden: true,
                focusOnShow: true,
                height:240,
                minDate: me.minValue,
                maxDate: me.maxValue,
                disabledDatesRE: me.disabledDatesRE,
                disabledDatesText: me.disabledDatesText,
                disabledDays: me.disabledDays,
                disabledDaysText: me.disabledDaysText,
                format: me.format,
                showToday: me.showToday,
                startDay: me.startDay,
                minText: format(me.minText, me.formatDate(me.minValue)),
                maxText: format(me.maxText, me.formatDate(me.maxValue)),
                listeners: {
                    select: {
                        scope: me,
                        fn: me.onSelect
                    },
                    monthdblclick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    yeardblclick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    OkClick: {
                        scope: me,
                        fn: me.onOKClick
                    },
                    CancelClick: {
                        scope: me,
                        fn: me.onCancelClick
                    }
                },
                keyNavConfig: {
                    esc: function () {
                        me.collapse();
                    }
                },
            };


            return Ext.create('Ext.ux.OnlyYearPicker', pickerConfig);
        },
        onCancelClick: function () {
            var me = this;
            me.selectDate = null;
            me.collapse();
        },
        onOKClick: function () {
            var me = this;
            if (me.selectDate) {
                me.setValue(me.selectDate);
                me.fireEvent('select', me, me.selectDate);
            }
            me.collapse();
        },
        onSelect: function (m, d) {
            var me = this;
            me.selectDate = new Date((d[0] + 1) + '/1/' + d[1]);
        },
        parseDate : function(value) {
            if(!value || Ext.isDate(value)){
                return value;
            }

            var me = this,
                val = me.safeParse(value, me.format),
                altFormats = me.altFormats,
                altFormatsArray = me.altFormatsArray,
                i = 0,
                len;

            if (!val && altFormats) {
                altFormatsArray = altFormatsArray || altFormats.split('|');
                len = altFormatsArray.length;
                for (; i < len && !val; ++i) {
                    val = me.safeParse(value, altFormatsArray[i]);
                }
            }
            return val;
        },
        safeParse : function(value, format) {
            var me = this,
                utilDate = Ext.Date,
                result = null,
                strict = me.useStrict,
                parsedDate;

            if (utilDate.formatContainsHourInfo(format)) {
                // if parse format contains hour information, no DST adjustment is necessary
                result = utilDate.parse(value, format, strict);
            } else {
                // set time to 12 noon, then clear the time
                parsedDate = utilDate.parse(value + ' ' + me.initTime, format + ' ' + me.initTimeFormat, strict);
                if (parsedDate) {
                    result = utilDate.clearTime(parsedDate);
                }
            }
            return result;
        },
        setMinValue : function(dt){
            var me = this,
                minValue = (Ext.isString(dt) ? me.parseDate(dt) : dt);

            me.minValue = minValue;
        },
        setMaxValue : function(dt){
            var me = this,
                maxValue = (Ext.isString(dt) ? me.parseDate(dt) : dt);

            me.maxValue = maxValue;
        }
    });
});

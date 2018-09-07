/**
 * 公共处理方法
 */
// 针对form中的基本组件为form表单中必填项添加红色*号标志
/*Ext.override(Ext.form.field.Base, {
    initComponent : function() {
        if (this.allowBlank !== undefined && !this.allowBlank) {
            if (this.fieldLabel) {
                this.fieldLabel += '<font color=red>*</font>';
            }
        }
        this.callParent(arguments);
    }
});

// 针对form中的容器组件为form表单中必填项添加红色*号标志
Ext.override(Ext.container.Container, {
    initComponent : function() {
        if (this.allowBlank !== undefined && !this.allowBlank) {
            if (this.fieldLabel) {
                this.fieldLabel += '<font color=red>*</font>';
            }
        }
        this.callParent(arguments);
    }
});*/

// 自定义Vtype验证
Ext.apply(Ext.form.VTypes, {
    // 验证固话和手机号码
    telAndMobile : function(val, field) {
        try {
            if (/^((\d{3,4}-)*\d{7,8}(-\d{3,4})*|1[34578]\d{9})$/
                    .test(val)) {
                return true;
                // (0(([1-2]\d{1})|([3-9]\d{2}))-\d{7,8})$/
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    },
    telAndMobileText : '请输入正确的电话号码',
    // 验证数值类型开始、结束输入范围    需要设置itemId或id属性
    numberRange : function(val, field) {
        try {
            var num = parseFloat(val);
            if (field.startNumberField) {
                var startNumberField = field.up('form').down('#' + field.startNumberField);
                startNumberField.setMaxValue(num);
            } else if (field.endNumberField) {
                var endNumberField = field.up('form').down('#' + field.endNumberField);
                endNumberField.setMinValue(num);
            }
            return true;
        } catch (e) {
            return false;
        }
    },
    numberRangeText : '开始数值不能大于结束数值'
});

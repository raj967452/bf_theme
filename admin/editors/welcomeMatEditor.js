Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'welcome-mat-options-editor',
    width: 300,
    height: 250,
    initComponent: function () {
        var me = this;
        Ext.Ajax.request({
            url: "/admin/app/entities/read?list=bfsettings@external&entityType=mzdb",
            method: 'get',
            success: function (res) {
                var response = JSON.parse(res.responseText),
                    siteIdIndex = 0;
                if (response.items.length > 0) {
                    try {
                        var countryCodeInput = me.down('#countrycode');
                        var currencyCodeInput = me.down('#currencycode');
                        countryCodeInput.setValue(response.items[0].item.bf_merchant_country_code);
                        currencyCodeInput.setValue(response.items[0].item.bf_merchant_currency_code);                      
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    var errormessage = me.down('#errormessage');
                    errormessage.setVisible(true);
                }
            }
        });
        this.items = [{
            xtype: 'panel',
            items: [{
                    xtype: 'mz-input-text',
                    fieldLabel: 'Country',
                    itemId: 'countrycode',
                    name: 'country',
                    readOnly: true,
                    anchor: '100%',
                    allowBlank: false
                }, {
                    xtype: 'mz-input-text',
                    fieldLabel: 'Currency Code',
                    itemId: 'currencycode',
                    name: 'currency',
                    readOnly: true,
                    anchor: '100%',
                    allowBlank: false
                },
                {
                    xtype: 'label',
                    html: '<p>Please complete the borderfree App configuration!</p>',
                    itemId: 'errormessage',
                    hidden: true,
                    style: 'color:#ff4400'
                }
            ]

        }];
        this.superclass.initComponent.apply(this, arguments);
    }
});
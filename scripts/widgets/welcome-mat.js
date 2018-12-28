require([
  "underscore",
  "modules/jquery-mozu",
  "hyprlive",
  "modules/modal-dialog",
  "modules/backbone-mozu",
  "modules/api"
], function(_, $, Hypr, modelDialog, Backbone, api) {
  //set base url
  var baseURL = window.location.origin + "/borderFree/";
  //Welcome mat widget template
  var WelcomeMatWidgetView = Backbone.MozuView.extend({
    templateName: "modules/borderFree/welcome-mat-widget",
    additionalEvents: {
      "change #country-select": "setCountry",
      "click #btnCountrySelect": "openWelcomeMatWidget"
    },
    openWelcomeMatWidget: function() {
      $("#countryModal").modal("show");
    },
    getCountries: function(e) {
      // e.prevntDefault();
      var self = this;
      console.log("getCountries!!");
      var hasCountries = JSON.parse(window.sessionStorage.getItem("countries")),
        hasCurrencies = JSON.parse(window.sessionStorage.getItem("currencies"));
      if (hasCountries !== null && hasCurrencies !== null) {
        self.model.set({
          country: hasCountries,
          selectedCountry: $.cookie("selected_country"),
          selectedCurrency: $.cookie("currency_code_override"),
          currency: hasCurrencies
        });
        window.view.render();
        if (self.$el.find(".welcome-mat-wrapper").hasClass("hidden")) {
          self.$el.find(".welcome-mat-wrapper").removeClass("hidden");
        }
      } else {
        api.request("GET", baseURL + "getBorderFreeCountries").then(
          function(resp) {
            console.log(resp);
            //Check if there is some resp
            if (typeof resp.message !== "undefined") {
              //check if its success and has resp data
              if (
                typeof resp.message.payload.getLocalizationDataResponse !==
                "undefined"
              ) {
                var rawRespData =
                  resp.message.payload.getLocalizationDataResponse;
                var borderFreeCountries = _.map(
                  _.where(rawRespData.countries.country, {}),
                  function(item) {
                    return {
                      name: item.name,
                      currencyCode: item.currencyCode,
                      locale: item.locale
                    };
                  }
                );
                var borderFreeCurrencies = _.map(
                  _.where(rawRespData.currencies.currency, {}),
                  function(item) {
                    return {
                      name: item.name,
                      symbol: item.symbol,
                      isCurrencyEnabled: item.isCurrencyEnabled
                    };
                  }
                );
                console.log("filtered country", borderFreeCountries);
                console.log("filtered currency", borderFreeCurrencies);
                //catch countries in localStorage
                window.sessionStorage.setItem(
                  "countries",
                  JSON.stringify(borderFreeCountries)
                );
                window.sessionStorage.setItem(
                  "currencies",
                  JSON.stringify(borderFreeCurrencies)
                );
                self.model.set({
                  country: borderFreeCountries,
                  selectedCountry: $.cookie("selected_country"),
                  selectedCurrency: $.cookie("currency_code_override"),
                  currency: borderFreeCurrencies
                });
                self.render();
                if (self.$el.find(".welcome-mat-wrapper").hasClass("hidden")) {
                  self.$el.find(".welcome-mat-wrapper").removeClass("hidden");
                }
                //console.log("countries", borderfreeCoountries);
              } else {
                console.log("error response!!");
              }
            } else {
              console.log("no response!!");
            }
          },
          function(e) {
            console.log(e);
          }
        );
      }
    },
    initialize: function() {},
    render: function() {
      Backbone.MozuView.prototype.render.apply(this);
      return this;
    },
    saveCookie: function(e) {
      var btnSave = $(e.currentTarget);
      btnSave.addClass("is-loading");
      var self = this;
      console.log(self.$el.find("#country-select option").length);
      var selectedCountry = self.$el.find("#country-select"),
        selectedCurrency = self.$el.find("#currency-select");

      var postData = {
        currencyCode: "USD",
        toCurrencyCode: selectedCurrency.val()
      };
      api
        .request("POST", baseURL + "getBorderFreeExchangeRates", postData)
        .then(
          function(resp) {
            console.log(resp);
            console.log("saving...");
            var selectedCountryName = $(selectedCountry).find(
              "option:selected"
            );

            self.setCookies(
              "currency_code_override",
              selectedCurrency.val(),
              1
            );
            self.setCookies("currency_rate_override", resp.rate, 1);
            self.setCookies(
              "selected_country",
              $.trim(selectedCountryName.text()),
              1
            );
            self.setCookies("currency_QuoteId", resp.referenceData, 1);
            self.setCookies(
              "currency_country_code",
              selectedCountryName.attr("data-code"),
              1
            );
            self.$el.find(".selectedCountry").text(selectedCountryName.text());
            console.log(selectedCountryName.text());
            window.location.reload();
          },
          function(e) {
            console.log(e);
          }
        );
    },
    setCookies: function(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      //$.cookie(cname, cvalue, expires);
      console.log("cookie saved!!");
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    setCountry: function(e) {
      var self = this,
        currentTarget = $(e.currentTarget),
        currencySelect = self.$el.find("#currency-select");
      //Update currency value with selected country
      currencySelect.val(currentTarget.val());

      //check if USA is selected
      if (currentTarget.find("option:selected").attr("data-code") == "US") {
        currencySelect.prop("disabled", true);
      } else {
        currencySelect.prop("disabled", false);
      }
    }
  });

  $(document).ready(function() {
    var welcomeMatViewModel = Backbone.MozuModel.extend();
    var welcomeMatWidgetModel = new welcomeMatViewModel();
    var welcomeMatWidgetView = (window.view = new WelcomeMatWidgetView({
      el: $(".welcome-mat-widget"),
      model: welcomeMatWidgetModel
    }));
    welcomeMatWidgetView.getCountries();
    //welcomeMatWidgetView.render();
  });
});

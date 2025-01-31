"use strict";

tutao.provide('tutao.tutanota.ctrl.ViewManager');

/**
 * The ViewManager is responsible for activating and deactivating views.
 *
 * @constructor
 */
tutao.tutanota.ctrl.ViewManager = function() {
	tutao.util.FunctionUtils.bindPrototypeMethodsToThis(this);
	var self = this;

	// tutao.tutanota.ctrl.View
	this._activeView = ko.observable(new tutao.tutanota.gui.NotFoundView()); // just a dummy view because null must be avoided
	this._internalUserLoggedIn = ko.observable(false);
	this._externalUserLoggedIn = ko.observable(false);
    this._windowWidthObservable = ko.observable(window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    this.headerBarViewModel = null;

	tutao.tutanota.gui.addWindowResizeListener(function(width, height) {
        self._windowWidthObservable(width);
	});
	this._buttons = [];
    this.currentColumnTitle = ko.observable("");
    this.previousColumnTitle = ko.observable("");
    this.welcomeMessage = ko.observable("");

    this.elementWithSubButtons = ko.observable(); // is set by the element whose sub-buttons shall be shown
};

tutao.tutanota.ctrl.ViewManager.prototype.loadCustomLogos = function() {
    var self = this;
    return tutao.locator.userController.getLoggedInUser().loadCustomer().then(function(customer) {
        return customer.loadProperties().then(function(properties) {
            self.updateLogos(properties);
        });
    });
};

tutao.tutanota.ctrl.ViewManager.prototype.updateLogos = function(properties) {
    var css = "";
    if (properties.getSmallLogo()) {
        css += "@media (max-width: 719px) { #logo { background-image: url('data:" + properties.getSmallLogo().getMimeType() + ";base64," + properties.getSmallLogo().getData() + "') !important; } }\n"
    }
    if (properties.getBigLogo()) {
        css += "@media (min-width: 720px) { #logo { background-image: url('data:" + properties.getBigLogo().getMimeType() + ";base64," + properties.getBigLogo().getData() + "') !important; } }\n"
    }
    document.getElementById("customStyle").innerHTML = css;
};

tutao.tutanota.ctrl.ViewManager.prototype.getLoggedInUserAccountType = function(){
    if (this._internalUserLoggedIn() || this._externalUserLoggedIn()) {
        return tutao.locator.userController.getLoggedInUser().getAccountType();
    }
    return null;
};

tutao.tutanota.ctrl.ViewManager.prototype.isFreeAccount = function() {
    return this.getLoggedInUserAccountType() == tutao.entity.tutanota.TutanotaConstants.ACCOUNT_TYPE_FREE;
};

tutao.tutanota.ctrl.ViewManager.prototype.isPremiumAccount = function() {
    return this.getLoggedInUserAccountType() == tutao.entity.tutanota.TutanotaConstants.ACCOUNT_TYPE_PREMIUM;
};

tutao.tutanota.ctrl.ViewManager.prototype.isOutlookAccount = function() {
    return this.getLoggedInUserAccountType() == tutao.entity.tutanota.TutanotaConstants.ACCOUNT_TYPE_STARTER;
};

/**
 * @return {Array.<tutao.tutanota.ctrl.View>} views All the views of this ViewManager.
 */
tutao.tutanota.ctrl.ViewManager.prototype.getViews = function() {
    return [tutao.locator.registrationView, tutao.locator.loginView, tutao.locator.mailView, tutao.locator.contactView, tutao.locator.fileView, tutao.locator.externalLoginView, tutao.locator.notSupportedView, tutao.locator.settingsView];
};

/**
 * @return {Array.<tutao.tutanota.ctrl.Button>} views The buttons of the navigation bar.
 */
tutao.tutanota.ctrl.ViewManager.prototype._createButtons = function(external) {
    var self = this;
    var buttons = [
        // internalUsers
        new tutao.tutanota.ctrl.Button('emails_label', 30, tutao.locator.navigator.mail, self.isInternalUserLoggedIn, false, "menu_mail", "mail", 'emails_alt', function () {
            return tutao.locator.navigator.hash() == '#box';
        }),
        new tutao.tutanota.ctrl.Button('contacts_label', 29, tutao.locator.navigator.contact, self.isInternalUserLoggedIn, false, "menu_contact", "contact", 'contacts_alt', function () {
            return tutao.locator.navigator.hash() == '#contact';
        }),


        // all supported
        new tutao.tutanota.ctrl.Button('upgradePremium_label', 28, function() {
            tutao.locator.navigator.settings();
            tutao.locator.settingsViewModel.show(tutao.tutanota.ctrl.SettingsViewModel.DISPLAY_ADMIN_PAYMENT);
        }, function() {
            return self.isFreeAccount() && tutao.locator.settingsViewModel.isActivateExtensionEnabled();
        }, true, "menu_upgradePremium", "upgrade", 'upgradePremium_label', function() {
            return tutao.locator.navigator.hash() == '#settings' && (self.isFreeAccount() && tutao.locator.settingsViewModel.displayed() == tutao.tutanota.ctrl.SettingsViewModel.DISPLAY_ADMIN_PAYMENT);
        }), // Execute this action direct to avoid pop up blockers


        new tutao.tutanota.ctrl.Button('invite_label', 28, function() {
            tutao.locator.navigator.newMail().then(function (success) {
                if (success) {
                    var mail = tutao.locator.mailViewModel.getComposingMail();
                    mail.composerSubject(tutao.locator.languageViewModel.get("invitationMailSubject_msg"));
                    mail.confidentialButtonSecure(false);
                    var username = tutao.locator.userController.getUserGroupInfo().getName();
                    tutao.locator.mailView.clearComposingBody(); // clear composing body to avoid signature in invitation email
                    tutao.locator.mailView.setComposingBody(tutao.locator.htmlSanitizer.sanitize(tutao.locator.languageViewModel.get("invitationMailBody_msg", {'{registrationLink}': "https://app.tutanota.de/#register", '{username}' : username, '{githubLink}':"https://github.com/tutao/tutanota"} ), true).text);
                }
            });

        }, self.isFreeAccount, false, "menu_invite", "invite", 'invite_alt'),

        new tutao.tutanota.ctrl.Button('settings_label', 27, tutao.locator.navigator.settings, self.isInternalUserLoggedIn, false, "menu_settings", "settings", 'settings_alt', function () {
            return tutao.locator.navigator.hash() == '#settings' && !(self.isFreeAccount() && tutao.locator.settingsViewModel.displayed() == tutao.tutanota.ctrl.SettingsViewModel.DISPLAY_ADMIN_PAYMENT);
        }),

        // external users
        new tutao.tutanota.ctrl.Button('register_label', 27, function () {
            if (self.getActiveView() == tutao.locator.loginView) {
                // use same tab
                tutao.locator.navigator.register();
            } else {
                // open new tab
                tutao.tutanota.gui.openLink("https://app.tutanota.de/#register");
            }
        }, function() {
            return (external && self._externalUserLoggedIn()) || (self.getActiveView() == tutao.locator.loginView);
        }, true, "menu_register", "register", 'register_alt'), // Execute this action direct to avoid pop up blockers

        // all supported
        new tutao.tutanota.ctrl.Button('community_label', 26, function () {
            tutao.tutanota.gui.openLink("https://tutanota.com/community");
        }, function() {
            return self.isFreeAccount() && !tutao.env.isIOSApp();
        }, true, "menu_community", "heart", 'community_label'), // Execute this action direct to avoid pop up blockers

        // all logged in
        new tutao.tutanota.ctrl.Button('logout_label', 25, function () {
            tutao.locator.progressDialogModel.open("loggingOut_msg").then(function() {
                tutao.locator.progressDialogModel.updateProgress(33);
                tutao.locator.mailViewModel.tryCancelAllComposingMails(false).then(function (confirmed) {
                    if (confirmed) {
                        tutao.locator.loginViewModel.storeEntropy().caught(function (e) {
                            console.log("error while storing entropy", e);
                        }).finally(function () {
                            tutao.locator.progressDialogModel.updateProgress(100);
                            tutao.locator.navigator.logout();
                            tutao.locator.progressDialogModel.close();
                        });
                    }
                });
            });
        }, self.isUserLoggedIn, false, "menu_logout", "logout", 'logout_alt')

        // all logged in
        // Just for local testing on mobile devices
        /*new tutao.tutanota.ctrl.Button('dev_label', 25, function () {
            tutao.locator.developerViewModel.open();
        }, function() {
            return tutao.env.type == tutao.Env.LOCAL || tutao.env.type == tutao.Env.LOCAL_COMPILED;
        }, false, "menu_dev", "star", 'dev_label'),*/
    ];

    return buttons;
};

/**
 * Initializes the ViewManager and all views.
 * @param {Boolean} external True if the views shall be loaded for an external user, false for an internal user.
 */
tutao.tutanota.ctrl.ViewManager.prototype.init = function(external) {
    var views = this.getViews();
	for (var i = 0; i < views.length; i++) {
		views[i].init(external, this._updateColumnTitle);
	}

    var self = this;


    this._buttons = this._createButtons(external);
    var getRightNavbarSize = function () {
        return $(document.getElementById("right-navbar")).innerWidth();
    };
    this.headerBarViewModel = new tutao.tutanota.ctrl.ButtonBarViewModel(this._buttons, "more_label", tutao.tutanota.gui.measureNavBarEntry);
    setTimeout(function () {
        self.headerBarViewModel.setButtonBarWidth(getRightNavbarSize());
    }, 0);
    this._windowWidthObservable.subscribe(function () {
        self.headerBarViewModel.setButtonBarWidth(getRightNavbarSize());
    });
};

tutao.tutanota.ctrl.ViewManager.prototype.getButtons = function() {
    return this._buttons;
};

tutao.tutanota.ctrl.ViewManager.prototype.feedbackSupported = function() {
    if (this.isUserLoggedIn()) {
        return tutao.tutanota.util.ClientDetector.getSupportedType() == tutao.tutanota.util.ClientDetector.SUPPORTED_TYPE_SUPPORTED || tutao.tutanota.util.ClientDetector.getSupportedType() == tutao.tutanota.util.ClientDetector.SUPPORTED_TYPE_LEGACY_SAFARI ;
    } else {
        return false;
    }
};

/**
 * Switches to another view
 * @param {tutao.tutanota.ctrl.View} view The view to display.
 * @param {Object=} params The parameters to provide to the view.
 */
tutao.tutanota.ctrl.ViewManager.prototype.select = function(view, params) {
	if (view.isForInternalUserOnly() && !tutao.locator.userController.isInternalUserLoggedIn()) {
		return;
	}
	if (this._activeView() !== view) { // only switch, if another view should be shown
		if (this._activeView() != null) {
			this._activeView().deactivate();
		}
		if (tutao.locator.userController.isInternalUserLoggedIn()) {
			this._internalUserLoggedIn(true);
            document.title = tutao.locator.userController.getUserGroupInfo().getMailAddress() + " - Tutanota";
            this.headerBarViewModel.moreButton.subButtonsText(tutao.locator.userController.getUserGroupInfo().getMailAddress());

		} else if (tutao.locator.userController.isExternalUserLoggedIn()) {
			this._externalUserLoggedIn(true);
            document.title = tutao.locator.userController.getUserGroupInfo().getMailAddress() + " - Tutanota";
            this.headerBarViewModel.moreButton.subButtonsText(tutao.locator.userController.getUserGroupInfo().getMailAddress());
		} else {
            // reset the document title
            document.title = "Tutanota";
            // reset the custom logos
            this.updateLogos(new tutao.entity.sys.CustomerProperties());
            this.headerBarViewModel.moreButton.subButtonsText(null);
        }
        this._activeView(view);
        view.activate(params);

        this.welcomeMessage( view.getWelcomeMessage == undefined ? "" : view.getWelcomeMessage() );

        tutao.tutanota.gui.adjustPanelHeight();
	}
};

/**
 * @return {tutao.tutanota.ctrl.View} the currently active view.
 */
tutao.tutanota.ctrl.ViewManager.prototype.getActiveView = function() {
	return this._activeView();
};

/**
 * @return {boolean} true, if the user is already logged in, false otherwise.
 */
tutao.tutanota.ctrl.ViewManager.prototype.isUserLoggedIn = function() {
	return (this._internalUserLoggedIn() || this._externalUserLoggedIn() || tutao.locator.loginViewModel.loginFinished());
};

/**
 * @return {boolean} true, if an internal user is already logged in, false otherwise.
 */
tutao.tutanota.ctrl.ViewManager.prototype.isInternalUserLoggedIn = function() {
	return this._internalUserLoggedIn() || tutao.locator.loginViewModel.loginFinished();
};

tutao.tutanota.ctrl.ViewManager.prototype.windowSizeChanged = function(width, height) {
    if (this.getActiveView() != null) {
        this.getActiveView().getSwipeSlider().windowSizeChanged(width, height);
    }
};

tutao.tutanota.ctrl.ViewManager.prototype._updateColumnTitle = function(currentTitle, previousTitle) {

    if (!currentTitle) {
        currentTitle = "";
    }
    if (!previousTitle) {
        previousTitle = tutao.lang("back_action");
    }

    if (!this.getActiveView().isShowLeftNeighbourColumnPossible()) {
        previousTitle = "";
    }

    this.currentColumnTitle(currentTitle);
    this.previousColumnTitle(previousTitle);
};


tutao.tutanota.ctrl.ViewManager.prototype.isModalDialogVisible = function() {
    return tutao.locator.buyDialogViewModel.visible()
        || tutao.locator.folderNameDialogViewModel.visible()
        || tutao.locator.modalDialogViewModel.visible()
        || tutao.locator.feedbackViewModel.showDialog()
        || tutao.locator.legacyDownloadViewModel.dialogVisible()
        || tutao.locator.progressDialogModel.showDialog()
        || tutao.locator.termsAndConditionsDialogViewModel.visible()
        || (tutao.locator.viewManager.elementWithSubButtons() != null && tutao.locator.viewManager.elementWithSubButtons().subButtonsVisible());
};

tutao.tutanota.ctrl.ViewManager.prototype.showNotAvailableForFreeDialog = function() {
    if (tutao.env.mode == tutao.Mode.App) {
        tutao.tutanota.gui.alert(tutao.lang("notAvailableInApp_msg"));
    } else {
        var message = tutao.lang("onlyAvailableForPremium_msg") + " " + tutao.lang("premiumOffer_msg") + " " + tutao.lang("moreInfo_msg");
        tutao.locator.modalDialogViewModel.showDialog(message, ["upgradeToPremium_action", "upgradeReminderCancel_action"], tutao.lang("upgradeReminderTitle_msg"), "https://tutanota.com/pricing", "/graphics/hab.png").then(function(selection) {
            if (selection == 0) {
                tutao.locator.navigator.settings();
                tutao.locator.settingsViewModel.show(tutao.tutanota.ctrl.SettingsViewModel.DISPLAY_ADMIN_PAYMENT);
            }
        })
    }
};




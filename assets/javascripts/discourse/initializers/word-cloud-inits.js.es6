import { withPluginApi } from 'discourse/lib/plugin-api';
import {
  getResolverOption,
} from "discourse-common/resolver";

export default {
  name: 'word-cloud-inits',
  initialize(container) {
    const currentUser = container.lookup("current-user:main");
    const siteSettings = container.lookup("site-settings:main");
    const isMobileDevice = getResolverOption("mobileView");

    if (!siteSettings.word_cloud_enabled || !currentUser || isMobileDevice) return;

    withPluginApi('0.8.13', api => {

      api.decorateWidget("hamburger-menu:generalLinks", function(helper) {
        return {href: "/wordcloud", rawLabel: I18n.t('word_cloud.hamburger_menu_label')}
      });

    });
  }
};

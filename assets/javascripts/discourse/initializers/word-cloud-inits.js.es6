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

    withPluginApi('0.8.40', api => {

      if (siteSettings.word_cloud_add_menu_item) {
        api.addCommunitySectionLink({
          name: "word cloud",
          route: "wordcloud",
          title: I18n.t("word_cloud.sidebar_menu_label"),
          text: I18n.t("word_cloud.sidebar_menu_label"),
        });
      }
    });
  }
};

import { withPluginApi } from "discourse/lib/plugin-api";
import { getResolverOption } from "discourse/resolver";
import { i18n } from "discourse-i18n";

export default {
  name: "word-cloud-inits",

  initialize(owner) {
    const currentUser = owner.lookup("service:current-user");
    const siteSettings = owner.lookup("service:site-settings");
    const isMobileDevice = getResolverOption("mobileView");

    if (!siteSettings.word_cloud_enabled || !currentUser || isMobileDevice) {
      return;
    }

    withPluginApi((api) => {
      if (siteSettings.word_cloud_add_menu_item) {
        api.addCommunitySectionLink({
          name: "word cloud",
          route: "wordcloud",
          title: i18n("word_cloud.sidebar_menu_label"),
          text: i18n("word_cloud.sidebar_menu_label"),
        });
      }
    });
  },
};

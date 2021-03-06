import { withPluginApi } from 'discourse/lib/plugin-api';

export default {
  name: 'word-cloud-inits',
  initialize(container) {
    const currentUser = container.lookup("current-user:main");
    const siteSettings = container.lookup("site-settings:main");
    const isMobileDevice = container.lookup('site:main').get('isMobileDevice');

    if (!siteSettings.word_cloud_enabled || !currentUser || isMobileDevice) return;

    withPluginApi('0.8.13', api => {

      api.decorateWidget("hamburger-menu:generalLinks", function(helper) {
        return {href: "/wordcloud", rawLabel: "Word Cloud"}
      });

    });
  }
};

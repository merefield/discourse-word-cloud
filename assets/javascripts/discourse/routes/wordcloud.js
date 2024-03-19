import DiscourseRoute from "discourse/routes/discourse";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { ajax } from "discourse/lib/ajax";
import EmberObject from "@ember/object";

export default DiscourseRoute.extend({
  model() {
    return ajax("/wordcloud.json")
      .then((result) => {
        return EmberObject.create({
          words: result.word_count.map((w) => {
            return EmberObject.create({
              text: w.word,
              href: `/search?q=${w.word}`,
              size: w.count,
            });
          }),
        });
      })
      .catch(popupAjaxError);
  },
});

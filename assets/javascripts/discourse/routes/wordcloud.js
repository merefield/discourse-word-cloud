import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import DiscourseRoute from "discourse/routes/discourse";

export default class WordcloudRoute extends DiscourseRoute {
  model() {
    return ajax("/wordcloud.json")
      .then((result) => ({
        words: result.word_count.map((word) => {
          return {
            text: word.word,
            href: `/search?q=${word.word}`,
            size: word.count,
          };
        }),
      }))
      .catch(popupAjaxError);
  }
}

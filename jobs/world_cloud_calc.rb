class Object
  def is_number?
    to_f.to_s == to_s || to_i.to_s == to_s
  end
end

module Jobs
    # frozen_string_literal: true

    class WordCloudCalc < ::Jobs::Scheduled
      every 1.minute
  
      def execute(args={})

        ignore_list = I18n.t("word_cloud_ignore_list")

        ignore_list_set = ignore_list.split('|').slice(0, SiteSetting.word_cloud_ignore_portion - 1)
        
        word_cloud_list = []


       if SiteSetting.word_cloud_source_categories.blank? then
        build = DB.build <<-SQL
          SELECT word as word, count(*) as count
          FROM ( 
            SELECT 
              regexp_split_to_table(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(raw, E'[\\n\\r\\u2028]+', ' ', 'g')
                        , '\(http[^\)]*\)', ' ', 'g')
                          , '[^\-a-zA-Z\s]+', '', 'g')
                          , '--+', '', 'g'), ' ') AS word
            FROM posts
            order by id desc
            limit 100000
          ) t
          WHERE LENGTH(word) >= #{SiteSetting.word_cloud_minimum_length}
          GROUP BY word
          ORDER BY count(*) desc
          LIMIT 2000
        SQL
        else
          build = DB.build <<-SQL
            SELECT word as word, count(*) as count
            FROM ( 
              SELECT 
                regexp_split_to_table(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(
                        regexp_replace(raw, E'[\\n\\r\\u2028]+', ' ', 'g')
                          , '\(http[^\)]*\)', ' ', 'g')
                            , '[^\-a-zA-Z\s]+', '', 'g')
                            , '--+', '', 'g'), ' ') AS word
              FROM posts p
              INNER JOIN topics t ON p.topic_id = t.id
              INNER JOIN categories c ON t.category_id = c.id
              WHERE c.id::varchar(255) = ANY (string_to_array('#{SiteSetting.word_cloud_source_categories}','|'))
              order by p.id desc
              limit 100000
            ) t
            WHERE LENGTH(word) >= #{SiteSetting.word_cloud_minimum_length}
            GROUP BY word
            ORDER BY count(*) desc
            LIMIT 2000
          SQL
        end

        result = build.query

        result.each do |w|
          downcase_word = w.word.downcase
          unless downcase_word.blank? || (ignore_list_set).include?(downcase_word)
            word_cloud_list << {word: downcase_word, count: w.count}
          end
          if word_cloud_list.count >= SiteSetting.word_cloud_set_size then
            break
          end
        end

        PluginStore.set(::WordCloud::PLUGIN_NAME, "world_cloud_list", word_cloud_list.as_json)

        Rails.logger.info ("Word Cloud: #{word_cloud_list.count} word statistics updated")
      end
    end
  end
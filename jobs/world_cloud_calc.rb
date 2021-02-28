class Object
  def is_number?
    to_f.to_s == to_s || to_i.to_s == to_s
  end
end

module Jobs
    # frozen_string_literal: true

    class WordCloudCalc < ::Jobs::Scheduled
      every 30.minutes
  
      def execute(args={})

        ignore_list = I18n.t("word_cloud_ignore_list")

        ignore_list_set = ignore_list.split('|').slice(0, SiteSetting.word_cloud_ignore_portion - 1)
        
        word_cloud_list = []
#SELECT TRIM("'" FROM TRIM('"' FROM (TRIM(TRAILING ';' FROM (TRIM(TRAILING ':' FROM regexp_split_to_table(raw, ' '))))))) AS word
#TRIM('**' FROM (TRIM(TRAILING ',' FROM (TRIM(TRAILING ':' FROM regexp_split_to_table(regexp_replace(raw,'[\n:*_#.]', '\s'), ' ')))))) AS word
#regexp_split_to_table(regexp_replace(REPLACE(REPLACE(raw, CHAR(13), ''), CHAR(10), ''),[:*_#.,], '\s'), ' ')) AS word
        build = DB.build <<-SQL
          SELECT word as word, count(*) as count
          FROM ( 
            SELECT 
              regexp_split_to_table(regexp_replace(regexp_replace(regexp_replace(raw, '[\\n\\r]+' ,' '), '\[.*?\]', '' ), '[^0-9a-zA-Z]+', '\s'), ' ') AS word
            FROM posts
            order by id desc
            limit 100000
          ) t
          WHERE LENGTH(word) >= #{SiteSetting.word_cloud_minimum_length}
          GROUP BY word
          ORDER BY count(*) desc
          LIMIT 2000
        SQL

        result = build.query

        result.each do |w|
          downcase_word = w.word.downcase
          no_symbol_word = downcase_word.gsub(/(\W|\d)/, "")
          unless no_symbol_word.blank? || (ignore_list_set).include?(no_symbol_word) || no_symbol_word.is_number? || no_symbol_word != downcase_word
            word_cloud_list << {word: no_symbol_word, count: w.count}
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
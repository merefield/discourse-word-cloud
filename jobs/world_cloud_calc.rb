module Jobs
    # frozen_string_literal: true
    class WordCloudCalc < ::Jobs::Scheduled
      every 20.minutes
  
      def execute(args={})
        
        word_cloud_list = []
#SELECT TRIM("'" FROM TRIM('"' FROM (TRIM(TRAILING ';' FROM (TRIM(TRAILING ':' FROM regexp_split_to_table(raw, ' '))))))) AS word
#TRIM('**' FROM (TRIM(TRAILING ',' FROM (TRIM(TRAILING ':' FROM regexp_split_to_table(regexp_replace(raw,'[\n:*_#.]', '\s'), ' ')))))) AS word
#regexp_split_to_table(regexp_replace(REPLACE(REPLACE(raw, CHAR(13), ''), CHAR(10), ''),[:*_#.,], '\s'), ' ')) AS word
        build = DB.build <<-SQL
          SELECT word as word, count(*) as count
          FROM ( 
            SELECT 
              regexp_split_to_table(regexp_replace(regexp_replace(regexp_replace(raw, '\[.*?\]',''), E'[\\n\\r]+', ' ', 'g' ), '[^0-9a-zA-Z]+', '\s'), ' ') AS word
            FROM posts
            order by id desc
            limit 100000
          ) t
          WHERE LENGTH(word) > #{SiteSetting.word_cloud_minimum_length}
          GROUP BY word
          ORDER BY count(*) desc
          LIMIT #{SiteSetting.word_cloud_set_size}
        SQL

        result = build.query

        result.each do |w|
          word_cloud_list << {word: w.word, count: w.count}
        end

        PluginStore.set(::WordCloud::PLUGIN_NAME, "world_cloud_list", word_cloud_list.as_json)

        Rails.logger.info ("Word Cloud: #{word_cloud_list.count} word statistics updated")
      end
    end
  end
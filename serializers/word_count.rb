class WordCloud::WordCountSerializer < ::ApplicationSerializer
  attributes :word,
             :count

  def word
    object.word
  end

  def lon
    object.count
  end
end
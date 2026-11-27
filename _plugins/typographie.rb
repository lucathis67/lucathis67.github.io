# frozen_string_literal: true

# Typographie fine, appliquée à chaque page HTML une fois le site construit,
# sans toucher aux sources : les textes s'écrivent naturellement (apostrophe
# droite, espace ordinaire avant « ? ») et le site publié reçoit la bonne forme.
#
# - Partout : l'apostrophe droite entre deux lettres devient une apostrophe
#   typographique (’).
# - Pages en français : espace fine insécable (U+202F) avant ; ! ? » et après «,
#   espace insécable (U+00A0) avant les deux-points. Seules les espaces déjà
#   présentes sont remplacées : rien n'est ajouté là où il n'y en a pas.
#
# Le texte des balises <script>, <style>, <pre>, <code> et <textarea> n'est pas
# touché. Dans les balises, seuls les attributs lisibles (alt, title,
# aria-label, content, placeholder) sont traités.
module LucathisTypographie
  NNBSP = " "
  NBSP = " "
  SPACES = /(?:[ \t\r\n  ]|&nbsp;|&#160;)+/
  PROTECTED = %w[script style pre code textarea].freeze
  READABLE_ATTRIBUTES = /(\s(?:alt|title|aria-label|content|placeholder)=")([^"]*)(")/i
  APOSTROPHE = /(?<=[[:alpha:]])(?:'|&#39;|&#x27;|&apos;)(?=[[:alpha:]])/

  module_function

  def text(fragment, french)
    fragment = fragment.gsub(APOSTROPHE, "’")
    return fragment unless french

    fragment
      .gsub(/(?<=[^\s  >;])#{SPACES}([;!?»])/o) { "#{NNBSP}#{Regexp.last_match(1)}" }
      .gsub(/(?<=[^\s  >;])#{SPACES}:/o, "#{NBSP}:")
      .gsub(/«#{SPACES}/o, "«#{NNBSP}")
  end

  def html(source, french)
    protected_tag = nil
    source.split(/(<!--.*?-->|<[^>]+>)/m).map do |part|
      if part.start_with?("<!--")
        part
      elsif part.start_with?("<") && part.end_with?(">")
        name = part[%r{\A</?\s*([a-zA-Z0-9-]+)}, 1]&.downcase
        if protected_tag
          protected_tag = nil if part.start_with?("</") && name == protected_tag
          part
        else
          protected_tag = name if PROTECTED.include?(name) && !part.start_with?("</") && !part.end_with?("/>")
          part.gsub(READABLE_ATTRIBUTES) { "#{Regexp.last_match(1)}#{text(Regexp.last_match(2), french)}#{Regexp.last_match(3)}" }
        end
      elsif protected_tag
        part
      else
        text(part, french)
      end
    end.join
  end
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |item|
  next unless item.output_ext == ".html" && item.output

  lang = item.data["lang"] || item.site.config["lang"]
  item.output = LucathisTypographie.html(item.output, lang.to_s.start_with?("fr"))
end

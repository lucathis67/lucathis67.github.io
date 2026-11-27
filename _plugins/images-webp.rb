# frozen_string_literal: true

# Versions WebP des photographies, branchées à la construction du site
# (27 novembre 2026), sans toucher aux sources : on continue d'écrire
# <img src="/images/…/photo.jpg" …> et le site publié reçoit, pour chaque
# photo qui a ses versions WebP (photo-800.webp, photo-1600.webp,
# photo-2400.webp…, faites par scripts/vignettes.sh) :
#
# - srcset : la liste des versions WebP, le navigateur choisit la plus légère
#   qui suffit à la largeur affichée et à la densité de l'écran ;
# - sizes : la largeur d'affichage de la photo, déduite de son bloc (rangée de
#   photos, photo et texte, carte de l'accueil…), sauf si la page en donne déjà
#   une ;
# - data-viewer-src : la plus grande version WebP, ouverte par le visualiseur.
#
# Le JPEG d'origine reste dans src : c'est lui que reçoivent les très rares
# navigateurs qui ignorent srcset. Les images qui ont déjà un srcset et les
# images Open Graph (balises <meta>) ne sont pas touchées : Facebook,
# WhatsApp et les messageries attendent un JPEG.
module LucathisWebp
  VOID = %w[area base br col embed hr img input link meta param source track wbr].freeze
  RAW = %w[script style textarea].freeze

  # Largeur affichée selon le bloc qui contient la photo, du plus proche au plus
  # lointain. Contenu : 1200 px au plus ; mobile jusqu'à 800 px (voir
  # _sass/_breakpoints.scss et _sass/_tokens.scss).
  SIZES = {
    "profile-hero" => ->(_) { "100vw" },
    "profile-portrait" => ->(_) { "(max-width: 520px) 100vw, 520px" },
    "landing-about" => ->(_) { "(max-width: 800px) 320px, 360px" },
    "service-photograph" => ->(_) { "(max-width: 800px) 100vw, 480px" },
    "une-secondary" => ->(_) { "(max-width: 800px) 100vw, 400px" },
    "feature" => ->(_) { "(max-width: 800px) 100vw, 800px" },
    "story-navigation-link" => ->(_) { "(max-width: 800px) 100vw, 600px" },
    "article-photo-text-bloc" => ->(_) { "(max-width: 800px) 100vw, 600px" },
    "photo-row-vh" => ->(_) { "(max-width: 800px) 100vw, 830px" },
    "photo-row-hv" => ->(_) { "(max-width: 800px) 100vw, 830px" },
    "photo-row" => lambda { |count|
      count = [count, 1].max
      if count == 1
        "(max-width: 1200px) 100vw, 1200px"
      else
        "(max-width: 800px) 100vw, (max-width: 1200px) #{(100.0 / count).round(1).to_s.sub(/\.0\z/, '')}vw, #{1200 / count}px"
      end
    }
  }.freeze
  DEFAULT_SIZES = "(max-width: 1200px) 100vw, 1200px"

  @variants = {}

  module_function

  def reset
    @variants = {}
  end

  # Versions WebP d'une image du site, triées par largeur : [[chemin, largeur], …].
  def variants(site, path)
    @variants[path] ||= begin
      base = path.sub(/\.jpe?g\z/i, "")
      pattern = /\A#{Regexp.escape(File.basename(base))}-(\d+)\.webp\z/
      Dir.glob(File.join(site.source, "#{base}-*.webp")).filter_map do |file|
        width = File.basename(file)[pattern, 1]
        ["#{base}-#{width}.webp", width.to_i] if width
      end.sort_by(&:last)
    end
  end

  def classes(tag)
    tag[/\sclass\s*=\s*"([^"]*)"/i, 1].to_s.split
  end

  def sizes_for(tag, ancestors)
    ([{ classes: classes(tag), images: 1 }] + ancestors.reverse).each do |element|
      element[:classes].each do |name|
        rule = SIZES[name]
        return rule.call(element[:images]) if rule
      end
    end
    DEFAULT_SIZES
  end

  def html(source, site)
    baseurl = site.config["baseurl"].to_s.chomp("/")
    parts = source.split(/(<!--.*?-->|<[^>]+>)/m)
    stack = []
    images = []
    raw = nil

    parts.each_with_index do |part, index|
      next unless part.start_with?("<") && !part.start_with?("<!")

      name = part[%r{\A</?\s*([a-zA-Z0-9-]+)}, 1]&.downcase
      next unless name

      if raw
        raw = nil if part.start_with?("</") && name == raw
      elsif part.start_with?("</")
        position = stack.rindex { |element| element[:name] == name }
        stack.slice!(position..) if position
      elsif name == "img"
        stack.each { |element| element[:images] += 1 }
        images << [index, stack.dup]
      elsif !VOID.include?(name) && !part.end_with?("/>")
        raw = name if RAW.include?(name)
        stack << { name: name, classes: classes(part), images: 0 }
      end
    end

    images.each do |index, ancestors|
      tag = parts[index]
      next if tag =~ /\ssrcset\s*=/i

      src = tag[/\ssrc\s*=\s*"([^"]+)"/i, 1]
      next unless src

      path = src.delete_prefix(baseurl)
      next unless path.start_with?("/images/") && path =~ /\.jpe?g\z/i

      list = variants(site, path)
      next if list.empty?

      attributes = +" srcset=\"#{list.map { |file, width| "#{baseurl}#{file} #{width}w" }.join(', ')}\""
      attributes << " sizes=\"#{sizes_for(tag, ancestors)}\"" unless tag =~ /\ssizes\s*=/i
      attributes << " data-viewer-src=\"#{baseurl}#{list.last.first}\"" unless tag =~ /\sdata-viewer-src\s*=/i
      parts[index] = tag.sub(%r{\s*/?>\z}) { |ending| "#{attributes}#{ending}" }
    end

    parts.join
  end
end

Jekyll::Hooks.register :site, :pre_render do
  LucathisWebp.reset
end

Jekyll::Hooks.register [:pages, :documents], :post_render do |item|
  next unless item.output_ext == ".html" && item.output

  item.output = LucathisWebp.html(item.output, item.site)
end

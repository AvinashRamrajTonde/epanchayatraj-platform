import { useEffect, useState } from "react";
import { publicService, type GalleryImage } from "../../../services/publicService";
import { resolveUrl } from "../../../utils/resolveUrl";
import { getYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "../../../utils/youtube";

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    publicService
      .getGallery()
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">फोटो गॅलरी</h1>
          <p className="text-teal-200 mt-2">गावातील विविध कार्यक्रम आणि क्षणचित्रे</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-600">गॅलरी रिक्त आहे</h3>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img, i) => {
                const ytId = img.videoUrl ? getYouTubeId(img.videoUrl) : null;
                const thumb = ytId ? getYouTubeThumbnail(ytId) : img.imageUrl ? resolveUrl(img.imageUrl) : null;
                return (
                  <div
                    key={img.id}
                    onClick={() => setLightbox(i)}
                    className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer group"
                  >
                    <div className="relative">
                      {thumb && (
                        <img
                          src={thumb}
                          alt={img.title || img.caption || ""}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      )}
                      {ytId ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-end">
                          {(img.title || img.caption) && (
                            <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                              {img.title && <p className="text-white text-sm font-semibold">{img.title}</p>}
                              {img.caption && <p className="text-white/70 text-xs">{img.caption}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && images[lightbox] && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {lightbox > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}
          {lightbox < images.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}
          {(() => {
            const cur = images[lightbox];
            const ytId = cur.videoUrl ? getYouTubeId(cur.videoUrl) : null;
            return ytId ? (
              <div className="w-[90vw] sm:w-[70vw] max-w-3xl" onClick={(e) => e.stopPropagation()}>
                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(ytId, true)}
                    title={cur.title || "YouTube Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <img
                src={resolveUrl(cur.imageUrl)}
                alt={cur.title || ""}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            );
          })()}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            {images[lightbox].title && <p className="text-white text-sm font-medium">{images[lightbox].title}</p>}
            <p className="text-white/50 text-xs mt-1">{lightbox + 1} / {images.length}</p>
          </div>
        </div>
      )}
    </>
  );
}

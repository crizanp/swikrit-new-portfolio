import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
export const alt = "Swikrit Pokhrel Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

interface OpenGraphImageProps {
  searchParams?: {
    title?: string;
    image?: string;
  };
}

export default function OpenGraphImage({ searchParams }: OpenGraphImageProps) {
  const title = decodeURIComponent(searchParams?.title ?? "Swikrit Pokhrel");
  const backgroundImage = searchParams?.image ? decodeURIComponent(searchParams.image) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
          position: "relative",
          background: "#050505",
          color: "#e8c547",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {backgroundImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backgroundImage}
            alt="Background"
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.92) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "28px",
              letterSpacing: "0.12em",
              color: "#f8e8a1",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "#e8c547",
              }}
            />
            SWIKRIT POKHREL
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "72px",
                lineHeight: 1.05,
                color: "#e8c547",
                maxWidth: "980px",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "30px",
                color: "#e5e7eb",
              }}
            >
              Video Editor and Motion Graphics Designer
            </p>
          </div>
        </div>
      </div>
    ),
    size
  );
}

import Modal from "@components/modal";
import { useTranslations } from "next-intl";
import Image, { StaticImageData } from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  name: string;
  image: StaticImageData;
  imageAlt: string;
  description: string;
  contributions?: string;
  url: string;
  urlText?: string;
  techUsed: string;
}

const ProjectsModal = ({
  open,
  onClose,
  name,
  image,
  imageAlt,
  description,
  contributions,
  url,
  urlText,
  techUsed,
}: Props) => {
  const t = useTranslations("Projects");

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-2xl max-h-[80vh] px-4 flex flex-col">
        <p className="text-center text-xl md:text-3xl font-bold mb-4">{name}</p>
        <div className="overflow-y-auto flex-1 scroll-hidden">
          {image && (
            <Image
              src={image}
              alt={imageAlt}
              className="w-full h-full rounded-xl mb-4 border-2 dark:border-white border-black"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlMmUyZTIiIC8+PC9zdmc+"
            />
          )}
          <div className="flex flex-col gap-5">
            <p>{description}</p>
            {contributions && (
              <div>
                <p>{t("contributions")}:</p>
                <ol className="ml-4">
                  {contributions?.split(".").map((contribution, index) => (
                    <li key={index} className="list-disc">
                      {contribution}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <p>
              {t("visitWebsite")}:{" "}
              <a className="underline" href={url} target="_blank">
                {urlText ?? url}
              </a>
            </p>
            <div>
              <p>{t("techUsed")}:</p>
              <p>{techUsed}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectsModal;

import { Breadcrumb } from '@/components/molecules/Breadcrumb';

type PageHeadingProps = {
  title: string;
  description?: string;
};

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
        <Breadcrumb />
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

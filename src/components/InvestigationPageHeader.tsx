
interface InvestigationPageHeaderProps {
  title: string;
  description: string;
  id?: string;
}

export function InvestigationPageHeader({ title, description, id }: InvestigationPageHeaderProps) {
  return <header className="investigation-page-header" id={id}>
    <h1 className="investigation-page-title">{title}</h1>
    <p className="investigation-page-description">{description}</p>
  </header>;
}

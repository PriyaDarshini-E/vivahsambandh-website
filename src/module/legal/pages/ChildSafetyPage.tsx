import { useTranslation } from 'react-i18next'
import LegalLayout, { type LegalSection } from '../components/LegalLayout'

export default function ChildSafetyPage() {
  const { t } = useTranslation()
  const sections = t('legal.childSafety.sections', { returnObjects: true }) as LegalSection[]

  return (
    <LegalLayout
      eyebrow={t('legal.childSafety.eyebrow')}
      title={t('legal.childSafety.title')}
      updated={t('legal.childSafety.updated')}
      intro={t('legal.childSafety.intro')}
      sections={Array.isArray(sections) ? sections : []}
    />
  )
}


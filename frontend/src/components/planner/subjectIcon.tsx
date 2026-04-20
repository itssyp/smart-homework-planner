import type { SvgIconComponent } from '@mui/icons-material';
import CalculateOutlined from '@mui/icons-material/CalculateOutlined';
import CodeOutlined from '@mui/icons-material/CodeOutlined';
import ScienceOutlined from '@mui/icons-material/ScienceOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import type { SxProps, Theme } from '@mui/material/styles';

const MAP: Record<string, SvgIconComponent> = {
  Calculate: CalculateOutlined,
  Code: CodeOutlined,
  Science: ScienceOutlined,
  MenuBook: MenuBookOutlined,
  School: SchoolOutlined,
};

/** Keys aligned with `Subject.icon_name` / create-subject form. */
export const SUBJECT_ICON_OPTIONS = Object.keys(MAP) as readonly string[];

interface SubjectIconProps {
  iconName?: string;
  color?: string;
  sx?: SxProps<Theme>;
}

export function SubjectIcon({ iconName, color, sx }: SubjectIconProps) {
  const Cmp = (iconName && MAP[iconName]) || SchoolOutlined;
  return <Cmp sx={{ color: color ?? 'text.secondary', ...sx }} fontSize="small" />;
}

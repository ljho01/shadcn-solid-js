export interface ComponentMeta {
  name: string;
  slug: string;
  description: string;
  category: 'layout' | 'form' | 'data-display' | 'feedback' | 'navigation' | 'overlay';
}

export const components: ComponentMeta[] = [
  // Layout
  { name: 'Accordion', slug: 'accordion', description: '접고 펼칠 수 있는 콘텐츠 영역', category: 'layout' },
  { name: 'Aspect Ratio', slug: 'aspect-ratio', description: '일정한 비율을 유지하는 컨테이너', category: 'layout' },
  { name: 'Card', slug: 'card', description: '콘텐츠를 그룹핑하는 카드 컨테이너', category: 'layout' },
  { name: 'Collapsible', slug: 'collapsible', description: '접기/펼치기 가능한 패널', category: 'layout' },
  { name: 'Resizable', slug: 'resizable', description: '크기 조절 가능한 패널 레이아웃', category: 'layout' },
  { name: 'Scroll Area', slug: 'scroll-area', description: '커스텀 스크롤바가 있는 스크롤 영역', category: 'layout' },
  { name: 'Separator', slug: 'separator', description: '콘텐츠를 구분하는 구분선', category: 'layout' },
  { name: 'Table', slug: 'table', description: '데이터를 행과 열로 표시하는 테이블', category: 'layout' },

  // Form
  { name: 'Button', slug: 'button', description: '클릭 가능한 버튼 컴포넌트', category: 'form' },
  { name: 'Checkbox', slug: 'checkbox', description: '체크박스 입력 컴포넌트', category: 'form' },
  { name: 'Combobox', slug: 'combobox', description: '검색 가능한 드롭다운 선택', category: 'form' },
  { name: 'Form', slug: 'form', description: '폼 유효성 검사 및 필드 관리', category: 'form' },
  { name: 'Input', slug: 'input', description: '텍스트 입력 필드', category: 'form' },
  { name: 'Input OTP', slug: 'input-otp', description: 'OTP 인증 코드 입력 필드', category: 'form' },
  { name: 'Label', slug: 'label', description: '폼 요소의 라벨', category: 'form' },
  { name: 'Native Select', slug: 'native-select', description: '네이티브 HTML select 요소', category: 'form' },
  { name: 'Radio Group', slug: 'radio-group', description: '라디오 버튼 그룹', category: 'form' },
  { name: 'Select', slug: 'select', description: '커스텀 드롭다운 선택 컴포넌트', category: 'form' },
  { name: 'Slider', slug: 'slider', description: '값을 선택하는 슬라이더', category: 'form' },
  { name: 'Switch', slug: 'switch', description: '켜기/끄기 토글 스위치', category: 'form' },
  { name: 'Textarea', slug: 'textarea', description: '여러 줄 텍스트 입력', category: 'form' },
  { name: 'Toggle', slug: 'toggle', description: '활성화/비활성화 토글 버튼', category: 'form' },
  { name: 'Toggle Group', slug: 'toggle-group', description: '그룹으로 묶인 토글 버튼들', category: 'form' },

  // Data Display
  { name: 'Avatar', slug: 'avatar', description: '사용자 프로필 이미지 또는 이니셜', category: 'data-display' },
  { name: 'Badge', slug: 'badge', description: '상태를 표시하는 배지', category: 'data-display' },
  { name: 'Calendar', slug: 'calendar', description: '날짜 선택 캘린더', category: 'data-display' },
  { name: 'Carousel', slug: 'carousel', description: '슬라이드 형태의 캐러셀', category: 'data-display' },
  { name: 'Chart', slug: 'chart', description: '데이터 시각화 차트 래퍼', category: 'data-display' },
  { name: 'Kbd', slug: 'kbd', description: '키보드 단축키 표시', category: 'data-display' },
  { name: 'Skeleton', slug: 'skeleton', description: '로딩 상태 플레이스홀더', category: 'data-display' },

  // Feedback
  { name: 'Alert', slug: 'alert', description: '중요한 메시지 알림', category: 'feedback' },
  { name: 'Alert Dialog', slug: 'alert-dialog', description: '확인이 필요한 모달 다이얼로그', category: 'feedback' },
  { name: 'Empty', slug: 'empty', description: '빈 상태 표시 컴포넌트', category: 'feedback' },
  { name: 'Progress', slug: 'progress', description: '진행 상태 표시 바', category: 'feedback' },
  { name: 'Sonner (Toast)', slug: 'sonner', description: '토스트 알림', category: 'feedback' },
  { name: 'Spinner', slug: 'spinner', description: '로딩 스피너', category: 'feedback' },

  // Navigation
  { name: 'Breadcrumb', slug: 'breadcrumb', description: '현재 페이지 위치 표시', category: 'navigation' },
  { name: 'Command', slug: 'command', description: '커맨드 팔레트', category: 'navigation' },
  { name: 'Menubar', slug: 'menubar', description: '수평 메뉴바', category: 'navigation' },
  { name: 'Navigation Menu', slug: 'navigation-menu', description: '사이트 내비게이션 메뉴', category: 'navigation' },
  { name: 'Pagination', slug: 'pagination', description: '페이지 네비게이션', category: 'navigation' },
  { name: 'Sidebar', slug: 'sidebar', description: '사이드 내비게이션 패널', category: 'navigation' },
  { name: 'Tabs', slug: 'tabs', description: '탭 기반 콘텐츠 전환', category: 'navigation' },

  // Overlay
  { name: 'Context Menu', slug: 'context-menu', description: '우클릭 컨텍스트 메뉴', category: 'overlay' },
  { name: 'Dialog', slug: 'dialog', description: '모달 다이얼로그 컴포넌트', category: 'overlay' },
  { name: 'Drawer', slug: 'drawer', description: '슬라이드 드로어 패널', category: 'overlay' },
  { name: 'Dropdown Menu', slug: 'dropdown-menu', description: '드롭다운 메뉴', category: 'overlay' },
  { name: 'Hover Card', slug: 'hover-card', description: '호버 시 표시되는 카드', category: 'overlay' },
  { name: 'Popover', slug: 'popover', description: '팝오버 컨테이너', category: 'overlay' },
  { name: 'Sheet', slug: 'sheet', description: '사이드 시트 패널', category: 'overlay' },
  { name: 'Tooltip', slug: 'tooltip', description: '호버 시 표시되는 툴팁', category: 'overlay' },
];

export const categories = [
  { id: 'layout' as const, label: '레이아웃' },
  { id: 'form' as const, label: '폼' },
  { id: 'data-display' as const, label: '데이터 표시' },
  { id: 'feedback' as const, label: '피드백' },
  { id: 'navigation' as const, label: '내비게이션' },
  { id: 'overlay' as const, label: '오버레이' },
];

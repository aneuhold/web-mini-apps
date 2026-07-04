/**
 * Plain-language content for the Aurora Colony Pub behind-the-scenes tour.
 * Kept separate from the page component so the wording is easy to edit
 * without touching layout logic.
 */

/** A single step in a helper's simple flow diagram. */
export type FlowStep = {
  label: string;
  detail: string;
};

/** One background helper and the job it quietly does. */
export type HelperInfo = {
  /** Friendly title for the job the helper does. */
  title: string;
  /** Emoji used as a lightweight icon. */
  icon: string;
  /** When the helper runs, in plain terms. */
  when: string;
  summary: string;
  flow: FlowStep[];
  highlights: string[];
};

/** A spot where the site keeps information. */
export type StorageInfo = {
  name: string;
  icon: string;
  summary: string;
  details: string[];
};

/** A simple guard that keeps spam and troublemakers out. */
export type SafetyLayer = {
  name: string;
  icon: string;
  description: string;
};

export const helpers: HelperInfo[] = [
  {
    title: 'Showing your Facebook posts',
    icon: '📱',
    when: 'Every time someone visits your site',
    summary:
      'Your latest Facebook posts show up right on your website. To keep pages loading quickly, the site keeps a recent copy of your posts on hand and shows that, instead of reaching out to Facebook for every single visitor.',
    flow: [
      { label: 'A visitor arrives', detail: 'They open your website' },
      { label: 'The saved copy', detail: 'Your recent posts are already on hand' },
      { label: 'Posts appear', detail: 'The page loads right away' }
    ],
    highlights: [
      'Visitors never wait on Facebook, so pages feel fast.',
      'Reusing the saved copy keeps everything running smoothly at no cost.'
    ]
  },
  {
    title: 'Keeping those posts up to date',
    icon: '🔄',
    when: 'Quietly, about every half hour',
    summary:
      "About every 30 minutes, a helper checks Facebook for anything new you've posted and refreshes the copy your website shows. That way visitors always see recent posts, while Facebook only gets contacted a couple dozen times a day instead of on every visit.",
    flow: [
      { label: 'A quiet check', detail: 'Happens on its own every half hour' },
      { label: 'Anything new?', detail: 'It looks at your Facebook page' },
      { label: 'Copy refreshed', detail: 'The latest posts are saved for the site' }
    ],
    highlights: [
      'You never have to lift a finger; it updates on its own.',
      'There is also a button to refresh right away after you post something.'
    ]
  },
  {
    title: 'Getting messages from customers',
    icon: '✉️',
    when: 'When someone fills out your contact form',
    summary:
      "When a customer sends a message through your contact form, a helper makes sure it's a real person and then emails the message straight to you. When you reply, it goes right back to the customer.",
    flow: [
      { label: 'A customer writes', detail: 'They fill out the form' },
      { label: 'Real person?', detail: 'Spam gets stopped here' },
      { label: 'Straight to your inbox', detail: 'The message is emailed to you' }
    ],
    highlights: [
      'Only genuine messages reach you; spam is filtered out first.',
      'You can reply from your email and it goes right to the customer.'
    ]
  },
  {
    title: 'Letting you update the site yourself',
    icon: '✏️',
    when: 'Only while you sign in to make edits',
    summary:
      'When you want to change some text or swap a photo, you sign in first. A helper takes care of that sign-in safely, so your login stays private. It only does its job during sign-in and then steps out of the way.',
    flow: [
      { label: 'You sign in', detail: 'Using your secure account' },
      { label: 'It confirms it is you', detail: 'Handled privately and safely' },
      { label: 'Ready to edit', detail: 'You can update text and photos' }
    ],
    highlights: [
      'Your login details are never exposed to anyone.',
      'It only runs during sign-in, nowhere else.'
    ]
  }
];

export const storage: StorageInfo[] = [
  {
    name: 'The saved posts',
    icon: '🗒️',
    summary: 'A quick-access spot that holds the recent copy of your Facebook posts.',
    details: [
      'This is what lets your site show posts instantly.',
      'It is refreshed on its own as you post new things.'
    ]
  },
  {
    name: 'Your photo library',
    icon: '🖼️',
    summary:
      'Every picture you upload for your menu, gallery, and about page is kept here, ready to appear on the site.',
    details: [
      'Photos you add through the editor land here automatically.',
      'Give each photo its own name so a new one does not replace an old one.'
    ]
  }
];

export const safetyLayers: SafetyLayer[] = [
  {
    name: 'Bot check',
    icon: '🤖',
    description:
      'A quick, near-invisible test that tells real customers apart from automated spam programs.'
  },
  {
    name: 'Hidden trap',
    icon: '🪤',
    description:
      'A hidden box on the form that only spam robots fill in. If it is filled, the message is quietly thrown out.'
  },
  {
    name: 'Traffic limits',
    icon: '🚦',
    description:
      'A cap on how many times anyone can use the form or helpers in a short span, so no one can flood them.'
  },
  {
    name: 'Sanity checks',
    icon: '✅',
    description:
      'A quick look to make sure a message actually resembles a real message before anything is done with it.'
  },
  {
    name: 'Approved sites only',
    icon: '🚧',
    description:
      'Only your real website is allowed to use these helpers, not some copycat pretending to be you.'
  },
  {
    name: 'Private keys stay private',
    icon: '🔑',
    description:
      'The passwords that connect to Facebook and email are locked away where visitors can never see them.'
  }
];

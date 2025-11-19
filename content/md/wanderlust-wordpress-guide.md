# Wanderlust Psychiatry Wordpress Site Guide

## Overall Website Structure

- **Pages** (Navigate directly to them via the sidebar)
  - These are what are actually shown on the site, and in the top nav bar. They have their own website address (`www.something.com/your-page`)
- **Templates** - Reusable content for Pages - [Direct Link](https://wanderlustpsychiatry.com/wp-admin/edit.php?post_type=elementor_library&tabs_group=library)
  - **Page templates** - [Direct Link](https://wanderlustpsychiatry.com/wp-admin/edit.php?post_type=elementor_library&tabs_group=library&elementor_library_type=page)
    - These are slightly misleading because of the common name with the top-level Pages. But think of them as starting points for a Page. They can be saved if wanted, and could be differing versions of a page you are trying out or playing with. But they are just a special type of Container.
  - **Section templates**
    - Avoid these. They are just an old version of container templates.
  - **Container templates** - [Direct Link](https://wanderlustpsychiatry.com/wp-admin/edit.php?post_type=elementor_library&tabs_group=library&elementor_library_type=container)
    - These are your reusable individual sections of content. Think of them like a single section of a page that you might be playing with / organizing
    - Reusable templates
      - Reusable container - This is just the naming scheme we decided on during a meeting. It is a template that is meant to represent a horizontal section that can be added all at once
      - Reusable component - Also just the naming scheme we decided on. It is a template that represents a small piece of UI that can be re-used. Such as a picture with an associated title and description. These can be very helpful because you can design how they look in every situation (desktop, tablet, mobile) and then re-use it without having to think too hard.
    - **NOTE**: The header is one of these templates! It's kind of strange 😊 If you want to modify the header, search for it in the templates and modify that.

## When Editing

- Generally interact with elements that have text on the left hand side of the view
- Shape dividers and other things (unclick them by clicking them again)
- At the bottom of each page there is a spot to drag a widget. This won't actually show to users, it is just a drag and drop zone basically if you want add something.

### To add a new thing either:

- Start fresh: Click the plus icon and probably choose flexbox

## When Changing the Overall Parts of the Site

- When changing content width, make sure to change it for every version of the site too (little desktop or tablet icon next to "Content Width")

# For Any Future Development / Engineer That Works on the Site

- It has menu editor, so go to that first if you are looking for something that isn't there (Settings -> Menu Editor). A lot of the menu items were moved around or hidden so it was easier to work with the site. So you will probably find what you are looking for there.
- It wasn't updated when last working on it because it didn't seem to have a net benefit at the time. It was still relatively up-to-date.

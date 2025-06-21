# Animation Utilities

Clean animation utilities that don't break existing layouts. Located in `@a11y.cool/utils`.

## Usage

### Scroll-Triggered Animation (Default)

```svelte
<script>
  import { animate } from '@a11y.cool/utils';
</script>

<section use:animate={{ delay: 200 }}>
  Your content here
</section>
```

### Immediate Animation on Page Load

```svelte
<script>
  import { animate } from '@a11y.cool/utils';
</script>

<section use:animate={{ delay: 200, triggerOnMount: true }}>
  Your content here
</section>
```

### Staggered Card Animations

```svelte
<script>
  import { animate } from '@a11y.cool/utils';
</script>

{#each items as item, index}
  <div use:animate={{ delay: 300 + (index * 100) }}>
    <Card>{item}</Card>
  </div>
{/each}
```

### Staggered Immediate Animations

```svelte
<script>
  import { animate } from '@a11y.cool/utils';
</script>

{#each items as item, index}
  <div use:animate={{ delay: 300 + (index * 100), triggerOnMount: true }}>
    <Card>{item}</Card>
  </div>
{/each}
```

## Animation Options

```typescript
interface AnimationOptions {
	delay?: number; // Animation delay in ms (default: 0)
	duration?: number; // Animation duration in ms (default: 600)
	threshold?: number; // Intersection observer threshold (default: 0.1)
	rootMargin?: string; // Intersection observer root margin (default: '0px 0px -50px 0px')
	initialTransform?: string; // Initial transform (default: 'translateY(30px)')
	finalTransform?: string; // Final transform (default: 'translateY(0)')
	triggerOnMount?: boolean; // Trigger animation immediately instead of scroll (default: false)
}
```

## Examples

### Fade In (Immediate)

```svelte
<div use:animate={{
  initialTransform: 'translateY(0)',
  finalTransform: 'translateY(0)',
  triggerOnMount: true
}}>
  Fade only
</div>
```

### Scale In (Scroll-Triggered)

```svelte
<div use:animate={{
  initialTransform: 'scale(0.9)',
  finalTransform: 'scale(1)'
}}>
  Scale animation
</div>
```

### Custom Timing (Immediate)

```svelte
<div use:animate={{
  delay: 500,
  duration: 800,
  triggerOnMount: true
}}>
  Custom timing
</div>
```

## When to Use Each Mode

### Use `triggerOnMount: true` for:

- Hero sections that should animate immediately
- Short pages where all content is visible
- Landing pages where you want immediate visual impact
- Forms or interactive elements that should be visible right away

### Use scroll-triggered (default) for:

- Long content pages
- Blog posts with lots of content
- Pages where content extends below the fold
- When you want progressive reveal as user scrolls

## Benefits

1. **No Layout Breaking**: Uses Svelte actions instead of wrapper components
2. **Clean Code**: Minimal animation code in your components
3. **Flexible**: Works with any existing HTML structure
4. **Performance**: Uses CSS transforms and intersection observer
5. **SSR Safe**: Works perfectly with server-side rendering
6. **Configurable**: Choose between scroll-triggered or immediate animations

## How It Works

The `animate` action:

1. Applies initial styles (opacity: 0, transform: translateY(30px))
2. If `triggerOnMount: true`: Triggers animation after delay
3. If `triggerOnMount: false`: Sets up intersection observer for scroll-triggered animation
4. Applies final styles with smooth transition

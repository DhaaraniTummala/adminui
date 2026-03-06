# ViewManager System

A clean, centralized system for managing custom views and toolbar customizations in the Cube Admin UI.

**Note: This system has replaced the old `entityconfig/configOverides` system and `DynamicBaseView` with a more robust, centralized approach.**

## How It Works

### 1. Register Custom Components
```javascript
import ViewRegistry from '../../core/ViewRegistry';

// Your component class
class MyComponent {
  constructor() {
    this.tableName = '12345';
    this.entityName = 'MyEntity';
  }

  getCustomToolbar() {
    return {
      customButtons: [
        {
          key: 'myButton',
          component: ({ onAction }) => (
            <Button onClick={() => onAction('myAction')}>
              My Button
            </Button>
          ),
          position: 'right',
          order: 0.5
        }
      ],
      defaultButtonStates: { myButtonSelected: true },
      defaultActions: [{ key: 'myAction', params: { active: true } }]
    };
  }

  getCustomizations() {
    return {
      tableName: this.tableName,
      entityName: this.entityName,
      customToolbar: this.getCustomToolbar(),
      filterHandlers: { myAction: this.handleMyAction.bind(this) }
    };
  }
}

// Register it
const myComponent = new MyComponent();
ViewRegistry.registerEntityCustomizations('12345', myComponent);
```

### 2. Import in index.js
```javascript
// src/views/custom/index.js
import './MyComponent.jsx';  // This registers the component
```

### 3. Automatic Integration
- **ToolbarManagerComponent** automatically detects and renders custom buttons
- **Custom actions** are automatically wired up
- **Button states** are managed automatically
- **Default actions** are applied on component mount

## Key Benefits

✅ **Simple Registration** - Just call `ViewRegistry.registerEntityCustomizations()`
✅ **Automatic Rendering** - Buttons appear without additional code
✅ **State Management** - Button states are handled automatically
✅ **Action Handling** - Custom actions are wired up automatically
✅ **No Global Objects** - Reliable, centralized system
✅ **Replaced Old System** - No more `entityconfig/configOverides` or `DynamicBaseView`
✅ **EnhancedBaseView** - Use `EnhancedDynamicBaseView` for dynamic configuration generation

## Button Configuration

```javascript
{
  key: 'uniqueKey',
  component: ({ buttonState, onButtonStateChange, onAction, style }) => (
    <Button 
      type={buttonState?.isSelected ? 'primary' : 'default'}
      onClick={() => onAction('actionKey', { active: true })}
    >
      Button Text
    </Button>
  ),
  position: 'right',  // 'left' or 'right'
  order: 0.5         // Lower numbers appear first
}
```

## Common Button Options

```javascript
{
  commonButtonOptions: {
    addOverrides: { text: 'Custom Add Text' },
    exportOverrides: { tooltip: 'Custom Export' }
  }
}
```

## Filter Handlers

```javascript
{
  filterHandlers: {
    myAction: (baseView, isActive) => {
      // Apply your custom filter logic
      if (isActive) {
        // Apply filter
      } else {
        // Remove filter
      }
    }
  }
}
```

## Migration from Old System

If you were using the old `entityconfig/configOverides` system:

1. **Replace `DynamicBaseView`** with `EnhancedDynamicBaseView`
2. **Move customizations** to use `ViewRegistry.registerEntityCustomizations()`
3. **Use `generateConfig()`** from `EnhancedDynamicBaseView` for dynamic configuration

## EnhancedDynamicBaseView

The new `EnhancedDynamicBaseView` includes:
- Dynamic configuration generation via `generateConfig(tableName)`
- ViewManager integration for customizations
- Hook system for extensibility
- Automatic custom view rendering

That's it! The system handles everything else automatically. 
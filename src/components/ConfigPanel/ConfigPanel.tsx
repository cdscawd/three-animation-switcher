import {
  ButtonLiquidGlass,
  CardLiquidGlass,
  CheckboxLiquidGlass,
  InputLiquidGlass,
  SliderLiquidGlass,
  SpaceLiquidGlass,
  TypographyLiquidGlass,
} from "@gatsby/liquidglassui";
import { useCallback, useState } from "react";
import { ANIMATION_REGISTRY } from "../../animations";
import { useAnimationParams } from "../../context/AnimationParamsContext";
import { getParamSchema } from "../../params";
import type { ParamField } from "../../params";
import "./ConfigPanel.scss";

const GLASS_PARAMS = { borderRadius: 12, strength: 2.35, edgeFalloff: 18 };
const BUTTON_GLASS_PARAMS = { borderRadius: 999, edgeFalloff: 14, strength: 1 };

function formatValue(value: number | string | boolean): string {
  if (typeof value === "number") {
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 1000) {
      return value.toExponential(2);
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(3);
  }
  return String(value);
}

function ParamControl({
  field,
  value,
  onChange,
}: {
  field: ParamField;
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
}) {
  if (field.type === "range") {
    const num = typeof value === "number" ? value : field.default;
    return (
      <div className="config-panel__field">
        <div className="config-panel__field-head">
          <TypographyLiquidGlass.Text className="config-panel__label">
            {field.label}
          </TypographyLiquidGlass.Text>
          <TypographyLiquidGlass.Text className="config-panel__value">
            {formatValue(num)}
          </TypographyLiquidGlass.Text>
        </div>
        <SliderLiquidGlass
          filterMode="filter"
          glassParams={GLASS_PARAMS}
          min={field.min}
          max={field.max}
          step={field.step}
          value={num}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </div>
    );
  }

  if (field.type === "number") {
    const num = typeof value === "number" ? value : field.default;
    return (
      <div className="config-panel__field">
        <TypographyLiquidGlass.Text className="config-panel__label">
          {field.label}
        </TypographyLiquidGlass.Text>
        <InputLiquidGlass
          filterMode="filter"
          glassParams={GLASS_PARAMS}
          type="number"
          value={String(num)}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </div>
    );
  }

  if (field.type === "boolean") {
    const checked = typeof value === "boolean" ? value : field.default;
    return (
      <div className="config-panel__field config-panel__field--row config-panel__field--boolean">
        <TypographyLiquidGlass.Text className="config-panel__label">
          {field.label}
        </TypographyLiquidGlass.Text>
        <CheckboxLiquidGlass
          filterMode="surface"
          glassParams={BUTTON_GLASS_PARAMS}
          checked={checked}
          onCheckedChange={onChange}
          aria-label={field.label}
          className="config-panel__checkbox"
        />
      </div>
    );
  }

  const color = typeof value === "string" ? value : field.default;
  return (
    <div className="config-panel__field config-panel__field--row">
      <TypographyLiquidGlass.Text className="config-panel__label">
        {field.label}
      </TypographyLiquidGlass.Text>
      <InputLiquidGlass
        filterMode="filter"
        glassParams={GLASS_PARAMS}
        type="color"
        value={color}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </div>
  );
}

export function ConfigPanel() {
  const { animationId, values, setParam, resetParams, exportJson } =
    useAnimationParams();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const schema = getParamSchema(animationId);
  const label =
    ANIMATION_REGISTRY.find((item) => item.id === animationId)?.label ??
    animationId;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportJson());
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1600);
    }
  }, [exportJson]);

  const handleExport = useCallback(() => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${animationId}-config.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [animationId, exportJson]);

  return (
    <CardLiquidGlass
      className="config-panel"
      filterMode="filter"
      glassParams={GLASS_PARAMS}
      aria-label="Animation parameters"
    >
      <CardLiquidGlass.Header className="config-panel__header">
        <TypographyLiquidGlass.Title level={5} className="config-panel__title">
          Parameters
        </TypographyLiquidGlass.Title>
        <TypographyLiquidGlass.Text className="config-panel__subtitle">
          {label}
        </TypographyLiquidGlass.Text>
      </CardLiquidGlass.Header>

      <CardLiquidGlass.Body className="config-panel__fields">
        {schema.length === 0 ? (
          <TypographyLiquidGlass.Text className="config-panel__empty">
            No tunable parameters for this animation.
          </TypographyLiquidGlass.Text>
        ) : (
          schema.map((field) => (
            <ParamControl
              key={field.key}
              field={field}
              value={values[field.key] ?? field.default}
              onChange={(next) => setParam(field.key, next)}
            />
          ))
        )}
      </CardLiquidGlass.Body>

      <CardLiquidGlass.Footer className="config-panel__actions">
        <SpaceLiquidGlass size="sm">
          <ButtonLiquidGlass
            filterMode="surface"
            glassParams={BUTTON_GLASS_PARAMS}
            size="sm"
            onClick={resetParams}
          >
            Reset
          </ButtonLiquidGlass>
          <ButtonLiquidGlass
            filterMode="surface"
            glassParams={BUTTON_GLASS_PARAMS}
            size="sm"
            onClick={handleCopy}
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "error"
                ? "Copy failed"
                : "Copy JSON"}
          </ButtonLiquidGlass>
          <ButtonLiquidGlass
            filterMode="surface"
            glassParams={BUTTON_GLASS_PARAMS}
            size="sm"
            variant="primary"
            onClick={handleExport}
          >
            Export
          </ButtonLiquidGlass>
        </SpaceLiquidGlass>
      </CardLiquidGlass.Footer>
    </CardLiquidGlass>
  );
}

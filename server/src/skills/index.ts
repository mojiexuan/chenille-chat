import { Skill, Tools, SystemPrompt, Tool } from "@/types";

class SkillManager {
  private skills: Map<string, Skill> = new Map();

  register(skill: Skill): void {
    if (this.skills.has(skill.name)) {
      throw new Error(`技能 "${skill.name}" 已注册`);
    }
    this.skills.set(skill.name, skill);
  }

  unregister(name: string): boolean {
    return this.skills.delete(name);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  getAll(): Skill[] {
    return Array.from(this.skills.values());
  }

  getTools(): Tools {
    const allTools: Tool[] = [];
    for (const skill of this.skills.values()) {
      allTools.push(...skill.tools);
    }
    return allTools;
  }

  getSystemPrompts(): SystemPrompt[] {
    const prompts: SystemPrompt[] = [];
    for (const skill of this.skills.values()) {
      if (skill.systemPrompt) {
        prompts.push(skill.systemPrompt);
      }
    }
    return prompts;
  }

  async initAll(): Promise<void> {
    for (const skill of this.skills.values()) {
      if (skill.init) {
        await skill.init();
      }
    }
  }

  clear(): void {
    this.skills.clear();
  }
}

export { SkillManager };

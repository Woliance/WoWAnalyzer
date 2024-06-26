import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';

import {
  absoluteMitigation,
  debuff,
  MajorDefensiveDebuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { ReactNode } from 'react';

export default class WrathfulDescent extends MajorDefensiveDebuff {
  constructor(options: Options) {
    //Currently Doesnt discriminate between players, seems to be a wowanal-wide issue.
    super(TALENTS.WRATHFUL_DESCENT_TALENT, debuff(SPELLS.EMPYREAN_HAMMER_DEBUFF), options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.WRATHFUL_DESCENT_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event) || event.sourceIsFriendly) {
      return;
    }

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, 0.05),
    });
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
